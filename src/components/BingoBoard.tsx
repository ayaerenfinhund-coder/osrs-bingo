'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'
import { BingoTile } from '@/components/BingoTile'
import { Leaderboard } from '@/components/Leaderboard'
import { OsrsModal } from '@/components/OsrsModal'
import { TileHistory, HistoryEntry } from '@/components/TileHistory'

type Player = Database['public']['Tables']['players']['Row']
type Tile = Database['public']['Tables']['tiles']['Row']
type Completion = Database['public']['Tables']['completions']['Row']

interface BingoBoardProps {
  initialPlayers: Player[]
  initialTiles: Tile[]
  initialCompletions: Completion[]
}

export function BingoBoard({
  initialPlayers,
  initialTiles,
  initialCompletions,
}: BingoBoardProps) {
  const [completions, setCompletions] = useState<Completion[]>(initialCompletions)
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [clearModalTileId, setClearModalTileId] = useState<number | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    return [...initialCompletions]
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 20)
      .flatMap((c) => {
        const player = initialPlayers.find(p => p.id === c.player_id)
        const tile = initialTiles.find(t => t.id === c.tile_id)
        if (!player || !tile) return []
        return [{
          id: `init-${c.created_at}-${c.player_id}-${c.tile_id}`,
          playerName: player.name,
          playerColor: player.color_hex,
          tileName: tile.task_name,
          action: 'completed' as const,
          timestamp: new Date(c.created_at ?? Date.now()),
        }]
      })
  })
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  useEffect(() => {
    setIsMounted(true)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'completions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCompletion = payload.new as Completion
            setCompletions((prev) => {
              if (prev.some(c => c.player_id === newCompletion.player_id && c.tile_id === newCompletion.tile_id)) return prev
              return [...prev, newCompletion]
            })
            const player = initialPlayers.find(p => p.id === newCompletion.player_id)
            const tile = initialTiles.find(t => t.id === newCompletion.tile_id)
            if (player && tile) {
              setHistory(prev => [{
                id: `${newCompletion.created_at}-${newCompletion.player_id}-${newCompletion.tile_id}`,
                playerName: player.name,
                playerColor: player.color_hex,
                tileName: tile.task_name,
                action: 'completed' as const,
                timestamp: new Date(newCompletion.created_at ?? Date.now()),
              }, ...prev].slice(0, 20))
            }
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old
            setCompletions((prev) =>
              prev.filter(
                (c) => !(
                  c.player_id === old.player_id &&
                  c.tile_id === old.tile_id
                )
              )
            )
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  async function handleTileClick(tileId: number) {
    if (!selectedPlayerId) return

    const isCompleted = completions.some(c => c.player_id === selectedPlayerId && c.tile_id === tileId)
    const key = `${selectedPlayerId}-${tileId}`
    setLoadingKey(key)

    setSelectedPlayerId(null)

    if (isCompleted) {
      setCompletions(prev => prev.filter(c => !(c.player_id === selectedPlayerId && c.tile_id === tileId)))
    } else {
      setCompletions(prev => [...prev, { player_id: selectedPlayerId, tile_id: tileId, created_at: new Date().toISOString() }])
    }

    const capturedPlayerId = selectedPlayerId
    try {
      const res = await fetch('/api/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: capturedPlayerId, tile_id: tileId, completed: isCompleted }),
      })
      if (!res.ok) throw new Error('Failed to toggle')
    } catch (err) {
      alert('Failed to update tile')
      if (isCompleted) {
        setCompletions(prev => [...prev, { player_id: capturedPlayerId, tile_id: tileId, created_at: new Date().toISOString() }])
      } else {
        setCompletions(prev => prev.filter(c => !(c.player_id === capturedPlayerId && c.tile_id === tileId)))
      }
    } finally {
      setLoadingKey(null)
    }
  }

  function handleTileLongPress(tileId: number) {
    const count = completions.filter(c => c.tile_id === tileId).length
    if (count === 0) return
    setClearModalTileId(tileId)
  }

  async function confirmClearTile() {
    const tileId = clearModalTileId
    if (!tileId) return
    setClearModalTileId(null)

    const key = `clear-${tileId}`
    setLoadingKey(key)
    const previousCompletions = [...completions]
    setCompletions(prev => prev.filter(c => c.tile_id !== tileId))

    try {
      const res = await fetch('/api/clear-tile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tile_id: tileId }),
      })
      if (!res.ok) throw new Error('Failed to clear tile')
    } catch {
      setCompletions(previousCompletions)
    } finally {
      setLoadingKey(null)
    }
  }

  const tileIndexMap = useMemo(() => {
    const map = new Map<number, number>()
    for (const t of initialTiles) map.set(t.id, t.index)
    return map
  }, [initialTiles])

  const completionsCount = useMemo(() => completions.reduce((acc, curr) => {
    const tileIndex = tileIndexMap.get(curr.tile_id) ?? 0
    const row = Math.floor(tileIndex / 7)
    const points = row + 1
    acc[curr.player_id] = (acc[curr.player_id] || 0) + points
    return acc
  }, {} as Record<number, number>), [completions, tileIndexMap])

  const tileCompletionMap = useMemo(() => {
    const map = new Map<number, number[]>()
    for (const c of completions) {
      const tileId = Number(c.tile_id)
      const arr = map.get(tileId) ?? []
      arr.push(Number(c.player_id))
      map.set(tileId, arr)
    }
    return map
  }, [completions])

  const handleTileClickCb = useCallback((tileId: number) => {
    return handleTileClick(tileId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayerId, completions])

  const handleTileLongPressCb = useCallback((tileId: number) => {
    return handleTileLongPress(tileId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completions])

  if (!isMounted) return null

  const clearModalTile = clearModalTileId ? initialTiles.find(t => t.id === clearModalTileId) : null
  const clearModalPlayers = clearModalTileId
    ? initialPlayers.filter(p => completions.some(c => c.tile_id === clearModalTileId && c.player_id === p.id))
    : []

  return (
    <>
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="w-full flex flex-col items-center">
        <div className="w-full mb-1 flex flex-col items-center gap-0.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 w-full mx-auto">
            {initialPlayers.map((p) => {
              const isSelected = selectedPlayerId === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlayerId(isSelected ? null : p.id)}
                  className={`flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap ${isSelected ? 'osrs-btn-active' : 'osrs-btn'}`}
                >
                  <div
                    className="w-3 h-3 rotate-45 shrink-0"
                    style={{
                      backgroundColor: p.color_hex,
                      border: '1px solid rgba(0,0,0,0.3)',
                    }}
                  />
                  <span
                    className="osrs-btn-text"
                    style={{ color: isSelected ? '#ffff00' : '#382418' }}
                  >
                    {p.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="w-full mt-2 mb-2">
          <div className="grid grid-cols-7 gap-[3px] w-full">
            {['B', 'I', 'N', 'G', 'O', '-'].map((letter, i) => (
              <div key={i} className="flex items-center justify-center font-black text-4xl sm:text-6xl text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
                {letter}
              </div>
            ))}
            <div className="flex items-center justify-center relative h-16 sm:h-20">
              <div 
                className="absolute transform -rotate-12 border-4 sm:border-8 border-red-600 text-red-600 font-black text-2xl sm:text-4xl px-2 sm:px-4 py-1 rounded-sm shadow-sm" 
                style={{ 
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  letterSpacing: '2px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: '2px 2px 0 rgba(0,0,0,0.1)'
                }}
              >
                FLEX
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full mt-1 osrs-board-frame"
          style={{
            opacity: loadingKey ? 0.7 : 1,
            pointerEvents: loadingKey ? 'none' : 'auto',
          }}
        >
          <div className="grid grid-cols-7 gap-[3px]">
              {initialTiles.map((tile) => {
                const playerIds = tileCompletionMap.get(tile.id) ?? []
                const completedBy = initialPlayers.filter(p => playerIds.includes(p.id))
                const isSelectedPlayerCompleted = selectedPlayerId ? playerIds.includes(selectedPlayerId) : false
                return (
                  <BingoTile
                    key={tile.id}
                    tile={tile}
                    completedBy={completedBy}
                    allPlayers={initialPlayers}
                    onClick={() => handleTileClickCb(tile.id)}
                    onLongPress={() => handleTileLongPressCb(tile.id)}
                    isEditable={!!selectedPlayerId}
                    isSelectedPlayerCompleted={isSelectedPlayerCompleted}
                  />
                )
              })}
            </div>
        </div>
      </div>

      <div className="w-full">
        <Leaderboard players={initialPlayers} completionsCount={completionsCount} />
      </div>
    </div>

    <TileHistory entries={history} />

    {clearModalTile != null && (
      <OsrsModal
        title="Clear Tile"
        message={
          clearModalPlayers.length === 1
            ? `Remove ${clearModalPlayers[0].name} from "${clearModalTile.task_name}"?`
            : `Remove ALL players from "${clearModalTile.task_name}"?`
        }
        confirmLabel={clearModalPlayers.length === 1 ? `Clear ${clearModalPlayers[0].name}` : 'Clear All'}
        cancelLabel="Cancel"
        danger={true}
        onConfirm={confirmClearTile}
        onCancel={() => setClearModalTileId(null)}
      />
    )}
    </>
  )
}
