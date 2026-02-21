'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'
import { BingoTile } from '@/components/BingoTile'
import { Leaderboard } from '@/components/Leaderboard'

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
  const [isMounted, setIsMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setIsMounted(true)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'completions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCompletions((prev) => [...prev, payload.new as Completion])
          } else if (payload.eventType === 'DELETE') {
            setCompletions((prev) =>
              prev.filter(
                (c) => !(
                  c.player_id === payload.old.player_id &&
                  c.tile_id === payload.old.tile_id
                )
              )
            )
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const completionsCount = completions.reduce((acc, curr) => {
    acc[curr.player_id] = (acc[curr.player_id] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  if (!isMounted) return null

  return (
    <div className="flex flex-col xl:flex-row gap-4 items-start justify-center w-full">
      {/* Bingo Grid */}
      <div className="flex-1 w-full">
        <div
          className="grid grid-cols-5 gap-1 p-2"
          style={{
            background: 'linear-gradient(135deg, #3d3022 0%, #2a2118 100%)',
            border: '3px solid #8c7a4a',
            boxShadow: 'inset 2px 2px 0 #c8a84b, inset -2px -2px 0 #5a4a2a, 0 8px 32px rgba(0,0,0,0.8)',
          }}
        >
          {initialTiles.map((tile) => {
            const tileCompletions = completions.filter((c) => c.tile_id === tile.id)
            const completedBy = initialPlayers.filter((p) =>
              tileCompletions.some((c) => c.player_id === p.id)
            )
            return (
              <BingoTile
                key={tile.id}
                tile={tile}
                completedBy={completedBy}
                allPlayers={initialPlayers}
              />
            )
          })}
        </div>

        {/* Player legend below grid */}
        <div
          className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-3 py-2"
          style={{
            background: '#2a2118',
            border: '1px solid #5a4a2a',
          }}
        >
          {initialPlayers.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: p.color_hex, boxShadow: `0 0 4px ${p.color_hex}88` }}
              />
              <span className="text-[11px]" style={{ color: '#ffff00', textShadow: '1px 1px 0 #000' }}>
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard sidebar */}
      <div className="w-full xl:w-64 shrink-0">
        <Leaderboard players={initialPlayers} completionsCount={completionsCount} />
      </div>
    </div>
  )
}
