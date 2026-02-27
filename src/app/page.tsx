import { createClient } from '@/lib/supabase/server'
import { BingoBoard } from '@/components/BingoBoard'
import { Countdown } from '@/components/Countdown'
import { TutorialModal } from '@/components/TutorialModal'

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
    <main className="min-h-screen p-1 sm:p-2 flex flex-col items-center gap-0">
      <TutorialModal />

      <div className="w-full max-w-6xl scroll-edge-top" />

      <div className="w-full max-w-6xl bg-osrs-parchment px-3 pt-3 pb-3 sm:px-6 sm:pt-4 sm:pb-4 flex flex-col items-center gap-0">

        <header className="w-full flex flex-col items-center gap-0.5 pb-1">
          <h1
            className="text-2xl sm:text-3xl font-black tracking-widest text-center"
            style={{
              fontFamily: 'Georgia, serif',
              color: '#3a2b12',
              textShadow: '1px 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            OSM Bingo
          </h1>
          <Countdown targetDate="2026-02-27T07:00:00+01:00" endDate="2026-03-27T23:59:00+01:00" />
          <div className="w-full mt-0.5 osrs-divider" />
        </header>

        <div className="w-full">
          <BingoBoard
            initialPlayers={players}
            initialTiles={tiles}
            initialCompletions={completions}
          />
        </div>

        <div className="w-full mt-2 osrs-divider" />
      </div>

      <div className="w-full max-w-6xl scroll-edge-bottom" />
    </main>
  )
}
