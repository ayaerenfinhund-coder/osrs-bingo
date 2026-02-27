import { Database } from '@/lib/database.types'

type Player = Database['public']['Tables']['players']['Row']

interface LeaderboardProps {
  players: Player[]
  completionsCount: Record<number, number>
}

const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32', '#aaaaaa', '#aaaaaa', '#aaaaaa']
const RANK_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th']

export function Leaderboard({ players, completionsCount }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    const aCount = completionsCount[a.id] || 0
    const bCount = completionsCount[b.id] || 0
    return bCount - aCount
  })

  const maxPoints = 75 // 5 rows × 5 tiles × (1+2+3+4+5)/5 avg = 5+10+15+20+25
  const totalPoints = Object.values(completionsCount).reduce((a, b) => a + b, 0)

  return (
    <div
      className="w-full flex flex-col mt-4"
      style={{
        background: '#1a1610',
        border: '4px solid #8a7235',
        boxShadow: '0 0 0 2px #050403, 6px 10px 28px rgba(0,0,0,0.85), inset 2px 2px 0 rgba(255,220,100,0.12), inset -1px -1px 0 rgba(0,0,0,0.6)',
      }}
    >
      <div className="px-4 py-2 flex items-center justify-between" style={{ background: '#2a1e08', borderBottom: '2px solid #0a0806', boxShadow: 'inset 0 -1px 0 rgba(255,220,100,0.08)' }}>
        <h2 className="text-sm tracking-widest uppercase" style={{ color: '#ffb000', textShadow: '1px 1px 0 #000' }}>Leaderboard</h2>
        <span className="text-xs uppercase tracking-wider" style={{ color: '#8c7a4a', textShadow: '1px 1px 0 #000' }}>
          <span style={{ color: '#ffb000' }}>{totalPoints}</span> total pts
        </span>
      </div>

      <div className="flex flex-col" style={{ background: '#1a1610', gap: '3px', padding: '5px' }}>
        {sortedPlayers.map((player, idx) => {
          const pts = completionsCount[player.id] || 0
          const pct = Math.round((pts / maxPoints) * 100)
          const isComplete = pts === maxPoints
          return (
            <div
              key={player.id}
              className="flex items-center gap-3 px-3 py-2"
              style={{
                background: '#3a2e1c',
                borderTop: '2px solid #6a5830',
                borderLeft: '2px solid #6a5830',
                borderRight: '2px solid #080604',
                borderBottom: '2px solid #080604',
                boxShadow: 'inset 1px 1px 0 rgba(255,220,100,0.1), inset -1px -1px 0 rgba(0,0,0,0.4)',
              }}
            >
              <span className="text-xs shrink-0 font-sans w-6 text-right" style={{ color: RANK_COLORS[idx] ?? '#aaaaaa', textShadow: '1px 1px 0 #000' }}>
                {RANK_LABELS[idx] ?? `${idx + 1}`}
              </span>
              <div className="w-2.5 h-2.5 rotate-45 shrink-0" style={{ backgroundColor: player.color_hex, border: '1px solid rgba(0,0,0,0.4)' }} />
              <span className="text-sm font-sans w-28 shrink-0 truncate" style={{ color: '#c8a84b', textShadow: '1px 1px 0 #000' }}>{player.name}</span>
              <div className="flex-1 h-2 overflow-hidden" style={{ background: '#0a0806', borderTop: '1px solid #050403', borderLeft: '1px solid #050403' }}>
                <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: isComplete ? '#3a9a3a' : player.color_hex }} />
              </div>
              <span className="text-xs shrink-0 font-sans w-14 text-right" style={{ color: isComplete ? '#7fff7f' : '#c8a84b', textShadow: '1px 1px 0 #000' }}>
                {pts}<span className="opacity-60"> pts</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
