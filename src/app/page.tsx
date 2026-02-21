import { createClient } from '@/lib/supabase/server'
import { BingoBoard } from '@/components/BingoBoard'

export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()

  const [{ data: players }, { data: tiles }, { data: completions }] = await Promise.all([
    supabase.from('players').select('*').order('id'),
    supabase.from('tiles').select('*').order('index'),
    supabase.from('completions').select('*'),
  ])

  if (!players || !tiles || !completions) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="p-8 text-center"
          style={{
            background: '#3d3022',
            border: '3px solid #8c7a4a',
            boxShadow: 'inset 2px 2px 0 #c8a84b, inset -2px -2px 0 #5a4a2a',
          }}
        >
          <p style={{ color: '#ff4444', textShadow: '1px 1px 0 #000' }}>
            Failed to load data. Check your Supabase configuration.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-3 sm:p-6 flex flex-col items-center gap-4">
      {/* Header */}
      <header className="w-full max-w-6xl flex items-center justify-between pb-3" style={{ borderBottom: '2px solid #8c7a4a' }}>
        <div>
          <h1
            className="text-3xl sm:text-5xl font-black tracking-widest uppercase"
            style={{
              color: '#c8a84b',
              textShadow: '2px 2px 0 #000, 0 0 20px rgba(200,168,75,0.3)',
              fontFamily: 'Georgia, serif',
            }}
          >
            OSRS BINGO
          </h1>
        </div>
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1 text-xs"
          style={{ color: '#8c7a4a', border: '1px solid #5a4a2a', background: '#2a2118' }}
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </header>

      {/* Board */}
      <div className="w-full max-w-6xl">
        <BingoBoard
          initialPlayers={players}
          initialTiles={tiles}
          initialCompletions={completions}
        />
      </div>
    </main>
  )
}
