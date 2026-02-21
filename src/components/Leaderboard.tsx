import { Database } from '@/lib/database.types'

type Player = Database['public']['Tables']['players']['Row']

interface LeaderboardProps {
  players: Player[]
  completionsCount: Record<number, number>
}

const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32', '#aaaaaa', '#aaaaaa', '#aaaaaa']

export function Leaderboard({ players, completionsCount }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    const aCount = completionsCount[a.id] || 0
    const bCount = completionsCount[b.id] || 0
    return bCount - aCount
  })

  const totalTiles = 25

  return (
    <div
      className="flex flex-col w-full"
      style={{
        background: 'linear-gradient(180deg, #3d3022 0%, #2a2118 100%)',
        border: '3px solid #8c7a4a',
        boxShadow: 'inset 2px 2px 0 #c8a84b, inset -2px -2px 0 #5a4a2a, 0 4px 16px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 text-center"
        style={{
          background: 'linear-gradient(180deg, #4a3a28 0%, #3a2d1e 100%)',
          borderBottom: '2px solid #8c7a4a',
          boxShadow: 'inset 0 -1px 0 #5a4a2a',
        }}
      >
        <h2
          className="text-base font-bold tracking-widest uppercase"
          style={{ color: '#c8a84b', textShadow: '1px 1px 0 #000' }}
        >
          ⚔ Leaderboard ⚔
        </h2>
      </div>

      {/* Player Rows */}
      <div className="flex flex-col divide-y" style={{ borderColor: '#3a2d1e' }}>
        {sortedPlayers.map((player, idx) => {
          const count = completionsCount[player.id] || 0
          const pct = Math.round((count / totalTiles) * 100)
          return (
            <div
              key={player.id}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors"
              style={{ borderColor: '#3a2d1e' }}
            >
              {/* Rank */}
              <span
                className="text-sm font-bold w-5 text-center shrink-0"
                style={{ color: RANK_COLORS[idx] ?? '#888', textShadow: '1px 1px 0 #000' }}
              >
                {idx + 1}
              </span>

              {/* Color swatch */}
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{
                  backgroundColor: player.color_hex,
                  boxShadow: `0 0 4px ${player.color_hex}99, inset 0 0 0 1px rgba(0,0,0,0.4)`,
                }}
              />

              {/* Name + progress bar */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-bold truncate"
                  style={{ color: '#ffff00', textShadow: '1px 1px 0 #000' }}
                >
                  {player.name}
                </div>
                {/* Progress bar */}
                <div
                  className="mt-1 h-1.5 w-full rounded-sm overflow-hidden"
                  style={{ background: '#1a1410' }}
                >
                  <div
                    className="h-full rounded-sm transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: count === totalTiles
                        ? 'linear-gradient(90deg, #00b000, #00ff00)'
                        : `linear-gradient(90deg, ${player.color_hex}88, ${player.color_hex})`,
                    }}
                  />
                </div>
              </div>

              {/* Score */}
              <div className="shrink-0 text-right">
                <span
                  className="text-sm font-bold"
                  style={{
                    color: count === totalTiles ? '#00ff00' : '#00b000',
                    textShadow: '1px 1px 0 #000',
                  }}
                >
                  {count}
                </span>
                <span className="text-xs" style={{ color: '#888' }}>/25</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer total */}
      <div
        className="px-4 py-2 text-center text-xs"
        style={{
          borderTop: '2px solid #8c7a4a',
          color: '#8c7a4a',
          background: 'linear-gradient(180deg, #2e2418 0%, #2a2118 100%)',
        }}
      >
        {Object.values(completionsCount).reduce((a, b) => a + b, 0)} total completions
      </div>
    </div>
  )
}
