'use client'

import { useMemo } from 'react'
import { Database } from '@/lib/database.types'

type Player = Database['public']['Tables']['players']['Row']
type Tile = Database['public']['Tables']['tiles']['Row']
type Completion = Database['public']['Tables']['completions']['Row']

interface RecapPageProps {
  players: Player[]
  tiles: Tile[]
  completions: Completion[]
}

const EVENT_START = new Date('2026-02-27T07:00:00+01:00')
const EVENT_END = new Date('2026-03-27T23:59:00+01:00')
const TOTAL_TILES = 25

function fmt(date: Date) {
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function duration(ms: number) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

function daysAfterStart(date: Date) {
  return ((date.getTime() - EVENT_START.getTime()) / 86400000).toFixed(1)
}

// Check bingo lines: rows, cols, diagonals on a 5x5 grid
function getBingoLines(completedTileIds: Set<number>, tiles: Tile[]) {
  const indexToId = new Map(tiles.map(t => [t.index, t.id]))
  const lines: { label: string; tiles: number[] }[] = []
  for (let r = 0; r < 5; r++) {
    lines.push({ label: `Row ${r + 1}`, tiles: [0,1,2,3,4].map(c => r * 5 + c) })
  }
  for (let c = 0; c < 5; c++) {
    lines.push({ label: `Col ${c + 1}`, tiles: [0,1,2,3,4].map(r => r * 5 + c) })
  }
  lines.push({ label: 'Diagonal ↘', tiles: [0,6,12,18,24] })
  lines.push({ label: 'Diagonal ↙', tiles: [4,8,12,16,20] })

  return lines.filter(line =>
    line.tiles.every(idx => {
      const id = indexToId.get(idx)
      return id !== undefined && completedTileIds.has(id)
    })
  ).map(l => l.label)
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 sm:p-4" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(90,64,16,0.4)' }}>
      <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#a88c5a' }}>{label}</div>
      <div className="text-lg sm:text-xl font-black leading-tight" style={{ color: '#e8d4a0' }}>{value}</div>
      {sub && <div className="text-[10px]" style={{ color: '#8a7050' }}>{sub}</div>}
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-6 mb-3">
      <div className="flex-1 h-px" style={{ background: 'rgba(90,64,16,0.5)' }} />
      <h2 className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#c8a86b' }}>{children}</h2>
      <div className="flex-1 h-px" style={{ background: 'rgba(90,64,16,0.5)' }} />
    </div>
  )
}

export function RecapPage({ players, tiles, completions }: RecapPageProps) {
  const stats = useMemo(() => {
    const sorted = [...completions].sort((a, b) =>
      new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
    )

    // Per-player completions
    const byPlayer = new Map<number, Completion[]>()
    for (const p of players) byPlayer.set(p.id, [])
    for (const c of sorted) {
      byPlayer.get(c.player_id)?.push(c)
    }

    // Per-tile completions
    const byTile = new Map<number, Completion[]>()
    for (const t of tiles) byTile.set(t.id, [])
    for (const c of sorted) {
      byTile.get(c.tile_id)?.push(c)
    }

    // First completion overall
    const firstEver = sorted[0]
    const lastEver = sorted[sorted.length - 1]

    // Player leaderboard
    const leaderboard = players.map(p => {
      const cs = byPlayer.get(p.id) ?? []
      const first = cs[0] ? new Date(cs[0].created_at ?? 0) : null
      const last = cs[cs.length - 1] ? new Date(cs[cs.length - 1].created_at ?? 0) : null
      const spanMs = first && last && cs.length > 1 ? last.getTime() - first.getTime() : null
      const avgGapMs = cs.length > 1 ? spanMs! / (cs.length - 1) : null
      const timeToFirstMs = first ? first.getTime() - EVENT_START.getTime() : null
      const completedTileIds = new Set(cs.map(c => c.tile_id))
      const bingoLines = getBingoLines(completedTileIds, tiles)
      return { player: p, count: cs.length, first, last, spanMs, avgGapMs, timeToFirstMs, bingoLines, completions: cs }
    }).sort((a, b) => b.count - a.count)

    // Tile stats
    const tileStats = tiles.map(t => {
      const cs = byTile.get(t.id) ?? []
      const first = cs[0] ? new Date(cs[0].created_at ?? 0) : null
      const firstPlayer = cs[0] ? players.find(p => p.id === cs[0].player_id) : null
      return { tile: t, count: cs.length, first, firstPlayer }
    })

    const completedTiles = tileStats.filter(t => t.count > 0)
    const uncompletedTiles = tileStats.filter(t => t.count === 0)
    const mostCompetitive = [...tileStats].sort((a, b) => b.count - a.count)[0]
    const rarest = completedTiles.length > 0 ? [...completedTiles].sort((a, b) => a.count - b.count)[0] : null

    // Longest gap between consecutive completions
    let longestGap = { ms: 0, before: null as Completion | null, after: null as Completion | null }
    for (let i = 1; i < sorted.length; i++) {
      const gap = new Date(sorted[i].created_at ?? 0).getTime() - new Date(sorted[i - 1].created_at ?? 0).getTime()
      if (gap > longestGap.ms) longestGap = { ms: gap, before: sorted[i - 1], after: sorted[i] }
    }

    // Completions per day (relative to event start)
    const perDay = new Map<string, number>()
    for (const c of sorted) {
      const d = new Date(c.created_at ?? 0)
      const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      perDay.set(key, (perDay.get(key) ?? 0) + 1)
    }

    // Most productive day
    let bestDay = { key: '', count: 0 }
    for (const [key, count] of perDay) {
      if (count > bestDay.count) bestDay = { key, count }
    }

    // Speed: time from event start to Nth completion
    const firstBloodPlayer = firstEver ? players.find(p => p.id === firstEver.player_id) : null
    const firstBloodTile = firstEver ? tiles.find(t => t.id === firstEver.tile_id) : null

    // Total unique tiles completed across all players
    const uniqueCompletedTiles = new Set(completions.map(c => c.tile_id)).size

    // Overall bingo lines per player
    return {
      sorted, byPlayer, byTile, leaderboard, tileStats, completedTiles, uncompletedTiles,
      mostCompetitive, rarest, longestGap, perDay, bestDay,
      firstEver, lastEver, firstBloodPlayer, firstBloodTile,
      uniqueCompletedTiles, totalCompletions: completions.length,
    }
  }, [players, tiles, completions])

  const maxDayCount = Math.max(...stats.perDay.values(), 1)

  return (
    <main className="min-h-screen p-2 sm:p-4 flex flex-col items-center gap-0">
      <div className="w-full max-w-5xl scroll-edge-top" />
      <div className="w-full max-w-5xl bg-osrs-parchment px-4 pt-6 pb-10 sm:px-10 sm:pt-8 flex flex-col">

        {/* Header */}
        <header className="flex flex-col items-center gap-1 pb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a88c5a' }}>
            {fmt(EVENT_START)} — {fmt(EVENT_END)}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-center" style={{ fontFamily: 'Georgia, serif', color: '#3a2b12', textShadow: '1px 1px 0 rgba(255,255,255,0.4)' }}>
            OSM Bingo
          </h1>
          <div className="text-sm font-bold uppercase tracking-widest" style={{ color: '#6b4d1c' }}>Event Recap</div>
          <div className="w-full mt-3 osrs-divider" />
        </header>

        {/* Top-level numbers */}
        <SectionHeader>Overview</SectionHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard label="Total Completions" value={String(stats.totalCompletions)} />
          <StatCard label="Unique Tiles Done" value={`${stats.uniqueCompletedTiles} / ${TOTAL_TILES}`} sub={`${Math.round(stats.uniqueCompletedTiles / TOTAL_TILES * 100)}% of board`} />
          <StatCard label="Tiles Untouched" value={String(stats.uncompletedTiles.length)} />
          <StatCard label="Most Active Day" value={stats.bestDay.key || '—'} sub={stats.bestDay.count ? `${stats.bestDay.count} completions` : undefined} />
        </div>

        {stats.firstEver && stats.firstBloodPlayer && stats.firstBloodTile && (
          <>
            <SectionHeader>Milestones</SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <StatCard
                label="First Blood"
                value={`${stats.firstBloodPlayer.name} — ${stats.firstBloodTile.task_name}`}
                sub={`${fmt(new Date(stats.firstEver.created_at ?? 0))} · Day ${daysAfterStart(new Date(stats.firstEver.created_at ?? 0))}`}
              />
              {stats.lastEver && (
                <StatCard
                  label="Final Completion"
                  value={`${players.find(p => p.id === stats.lastEver!.player_id)?.name ?? '?'} — ${tiles.find(t => t.id === stats.lastEver!.tile_id)?.task_name ?? '?'}`}
                  sub={fmt(new Date(stats.lastEver.created_at ?? 0))}
                />
              )}
              {stats.mostCompetitive && (
                <StatCard
                  label="Most Competed Tile"
                  value={stats.mostCompetitive.tile.task_name}
                  sub={`${stats.mostCompetitive.count} / ${players.length} players completed it`}
                />
              )}
              {stats.rarest && (
                <StatCard
                  label="Rarest Completion"
                  value={stats.rarest.tile.task_name}
                  sub={`Only ${stats.rarest.count} player${stats.rarest.count > 1 ? 's' : ''} got it`}
                />
              )}
              {stats.longestGap.ms > 0 && stats.longestGap.before && stats.longestGap.after && (
                <StatCard
                  label="Longest Dry Streak"
                  value={duration(stats.longestGap.ms)}
                  sub={`${fmt(new Date(stats.longestGap.before.created_at ?? 0))} → ${fmt(new Date(stats.longestGap.after.created_at ?? 0))}`}
                />
              )}
            </div>
          </>
        )}

        {/* Player leaderboard */}
        <SectionHeader>Player Standings</SectionHeader>
        <div className="flex flex-col gap-2">
          {stats.leaderboard.map((row, i) => {
            const pct = Math.round(row.count / TOTAL_TILES * 100)
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`
            return (
              <div key={row.player.id} className="p-3 sm:p-4 flex flex-col gap-2" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(90,64,16,0.4)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black w-8 shrink-0 text-center">{medal}</span>
                  <div className="w-3 h-3 rotate-45 shrink-0" style={{ backgroundColor: row.player.color_hex, border: '1px solid rgba(0,0,0,0.4)' }} />
                  <span className="font-black text-sm sm:text-base flex-1" style={{ color: row.player.color_hex }}>{row.player.name}</span>
                  <span className="font-black text-sm" style={{ color: '#e8d4a0' }}>{row.count}<span className="text-xs font-normal opacity-60">/25</span></span>
                  <span className="text-xs font-bold ml-1" style={{ color: '#a88c5a' }}>({pct}%)</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: row.player.color_hex, opacity: 0.85 }} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-[10px]" style={{ color: '#a88c5a' }}>
                  {row.first && (
                    <div><span className="opacity-60">First: </span><span style={{ color: '#c8a86b' }}>{fmt(row.first)}</span></div>
                  )}
                  {row.last && row.count > 1 && (
                    <div><span className="opacity-60">Last: </span><span style={{ color: '#c8a86b' }}>{fmt(row.last)}</span></div>
                  )}
                  {row.timeToFirstMs !== null && row.timeToFirstMs > 0 && (
                    <div><span className="opacity-60">Time to first: </span><span style={{ color: '#c8a86b' }}>{duration(row.timeToFirstMs)}</span></div>
                  )}
                  {row.avgGapMs !== null && (
                    <div><span className="opacity-60">Avg gap: </span><span style={{ color: '#c8a86b' }}>{duration(row.avgGapMs)}</span></div>
                  )}
                  {row.bingoLines.length > 0 && (
                    <div className="col-span-2 sm:col-span-4">
                      <span className="opacity-60">Bingo lines: </span>
                      <span style={{ color: '#7ec87e' }}>{row.bingoLines.join(', ')}</span>
                    </div>
                  )}
                  {row.count === 0 && (
                    <div className="col-span-2 sm:col-span-4" style={{ color: '#8a7050' }}>No completions</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Activity timeline (bar chart by day) */}
        {stats.perDay.size > 0 && (
          <>
            <SectionHeader>Daily Activity</SectionHeader>
            <div className="p-3 sm:p-4" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(90,64,16,0.4)' }}>
              <div className="flex items-end gap-1 h-24">
                {Array.from(stats.perDay.entries()).map(([day, count]) => (
                  <div key={day} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    <div
                      className="w-full rounded-sm"
                      style={{
                        height: `${Math.round((count / maxDayCount) * 80)}px`,
                        background: '#c8a86b',
                        opacity: 0.7,
                        minHeight: 4,
                      }}
                    />
                    <span className="text-[8px] truncate w-full text-center" style={{ color: '#8a7050' }}>{day}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[9px]" style={{ color: '#6b4d1c' }}>
                <span>0</span>
                <span>completions per day</span>
                <span>{maxDayCount}</span>
              </div>
            </div>
          </>
        )}

        {/* Tile-by-tile breakdown */}
        <SectionHeader>Tile Breakdown</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {stats.tileStats
            .sort((a, b) => b.count - a.count || a.tile.index - b.tile.index)
            .map(({ tile, count, first, firstPlayer }) => (
              <div key={tile.id} className="flex items-center gap-3 px-3 py-2" style={{ background: 'rgba(0,0,0,0.12)', border: '1px solid rgba(90,64,16,0.3)' }}>
                {tile.icon_id && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/icon?name=${tile.icon_id}`}
                    alt={tile.task_name}
                    width={24}
                    height={24}
                    className="image-pixelated shrink-0 opacity-80"
                    style={{ maxWidth: 24, maxHeight: 24 }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold truncate" style={{ color: count > 0 ? '#e8d4a0' : '#6b4d1c' }}>{tile.task_name}</div>
                  {first && firstPlayer ? (
                    <div className="text-[9px]" style={{ color: '#8a7050' }}>
                      First: <span style={{ color: firstPlayer.color_hex }}>{firstPlayer.name}</span>
                      <span className="opacity-60"> · {fmt(first)} · Day {daysAfterStart(first)}</span>
                    </div>
                  ) : (
                    <div className="text-[9px]" style={{ color: '#5a4010' }}>Not completed</div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-black" style={{ color: count > 0 ? '#7ec87e' : '#5a4010' }}>{count}<span className="text-[9px] font-normal opacity-60">/{players.length}</span></div>
                </div>
              </div>
            ))}
        </div>

        {/* Uncompleted tiles */}
        {stats.uncompletedTiles.length > 0 && (
          <>
            <SectionHeader>Never Completed</SectionHeader>
            <div className="flex flex-wrap gap-2">
              {stats.uncompletedTiles.map(({ tile }) => (
                <div key={tile.id} className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(90,64,16,0.3)', color: '#6b4d1c' }}>
                  {tile.icon_id && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/icon?name=${tile.icon_id}`} alt="" width={14} height={14} className="image-pixelated opacity-40" style={{ maxWidth: 14, maxHeight: 14 }} />
                  )}
                  {tile.task_name}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Back link */}
        <div className="mt-8 flex justify-center">
          <a
            href="/"
            className="px-6 py-2 text-xs font-black uppercase tracking-widest transition-all hover:brightness-110 active:scale-95"
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(90,64,16,0.5)', color: '#c8a86b' }}
          >
            ← Back to Board
          </a>
        </div>

        <div className="w-full mt-6 osrs-divider" />
      </div>
      <div className="w-full max-w-5xl scroll-edge-bottom" />
      <footer className="pb-8" />
    </main>
  )
}
