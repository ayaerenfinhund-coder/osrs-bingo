import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Image from 'next/image'

export default async function DMPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const key = resolvedSearchParams.key

  if (key !== process.env.ADMIN_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="p-8 text-center max-w-sm w-full"
          style={{
            background: '#3d3022',
            border: '3px solid #8c7a4a',
            boxShadow: 'inset 2px 2px 0 #c8a84b, inset -2px -2px 0 #5a4a2a',
          }}
        >
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#ff4444', textShadow: '1px 1px 0 #000' }}>
            Access Denied
          </h1>
          <p className="text-sm" style={{ color: '#aaa' }}>Provide the correct admin key via <code style={{ color: '#c8a84b' }}>?key=...</code></p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const [{ data: players }, { data: tiles }, { data: completions }] = await Promise.all([
    supabase.from('players').select('*').order('id'),
    supabase.from('tiles').select('*').order('index'),
    supabase.from('completions').select('*'),
  ])

  if (!players || !tiles || !completions) {
    return <div className="p-8" style={{ color: '#ff4444' }}>Failed to load data.</div>
  }

  return (
    <main className="min-h-screen p-3 sm:p-6 flex flex-col items-center gap-4">
      <div className="w-full max-w-6xl flex flex-col gap-4">

        {/* Header */}
        <header
          className="flex flex-wrap justify-between items-center gap-4 pb-3"
          style={{ borderBottom: '2px solid #8c7a4a' }}
        >
          <h1
            className="text-2xl sm:text-3xl font-black tracking-widest uppercase"
            style={{ color: '#c8a84b', textShadow: '2px 2px 0 #000', fontFamily: 'Georgia, serif' }}
          >
            ⚙ DM Panel
          </h1>
          <div className="flex flex-wrap gap-2">
            {players.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 px-2 py-1 text-xs"
                style={{ background: '#2a2118', border: '1px solid #5a4a2a' }}
              >
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color_hex, boxShadow: `0 0 4px ${p.color_hex}88` }} />
                <span style={{ color: '#ffff00' }}>{p.name}</span>
              </div>
            ))}
          </div>
        </header>

        <p className="text-xs" style={{ color: '#8c7a4a' }}>Click a player button to toggle their completion on that tile.</p>

        {/* Grid */}
        <div
          className="grid grid-cols-5 gap-1 p-2"
          style={{
            background: 'linear-gradient(135deg, #3d3022 0%, #2a2118 100%)',
            border: '3px solid #8c7a4a',
            boxShadow: 'inset 2px 2px 0 #c8a84b, inset -2px -2px 0 #5a4a2a',
          }}
        >
          {tiles.map((tile) => {
            const tileCompletions = completions.filter(c => c.tile_id === tile.id)
            const completedBy = players.filter(p => tileCompletions.some(c => c.player_id === p.id))
            const isFullyComplete = completedBy.length === players.length

            return (
              <div
                key={tile.id}
                className="flex flex-col gap-1 p-1.5 overflow-hidden"
                style={{
                  background: isFullyComplete
                    ? 'linear-gradient(145deg, #1a3a1a 0%, #0e1e0e 100%)'
                    : 'linear-gradient(145deg, #4a3a28 0%, #2e2418 100%)',
                  border: isFullyComplete ? '2px solid #2d6b2d' : '2px solid #6b5a35',
                  boxShadow: 'inset 1px 1px 0 rgba(200,168,75,0.2), inset -1px -1px 0 rgba(0,0,0,0.4)',
                  minHeight: '130px',
                }}
              >
                {/* Icon + Name */}
                <div className="flex flex-col items-center gap-1">
                  {tile.icon_id && (
                    <div className="relative w-10 h-10">
                      <Image
                        src={`https://oldschool.runescape.wiki/images/${encodeURIComponent(tile.icon_id)}`}
                        alt={tile.task_name}
                        fill
                        className="object-contain"
                        unoptimized
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                  )}
                  <div
                    className="text-[9px] font-bold text-center leading-tight"
                    style={{ color: isFullyComplete ? '#00ff00' : '#ffff00', textShadow: '1px 1px 0 #000' }}
                  >
                    {tile.task_name}
                  </div>
                </div>

                {/* Player toggle buttons */}
                <div className="flex flex-wrap gap-[3px] justify-center mt-auto">
                  {players.map(player => {
                    const isCompleted = tileCompletions.some(c => c.player_id === player.id)
                    return (
                      <form
                        key={player.id}
                        action={async () => {
                          'use server'
                          const supabase = await createClient()
                          if (isCompleted) {
                            await supabase.from('completions').delete().match({ player_id: player.id, tile_id: tile.id })
                          } else {
                            await supabase.from('completions').insert({ player_id: player.id, tile_id: tile.id })
                          }
                          revalidatePath('/dm-panel')
                        }}
                      >
                        <button
                          type="submit"
                          title={`${isCompleted ? 'Remove' : 'Add'} ${player.name}`}
                          className="w-5 h-5 rounded-sm transition-all hover:scale-110 active:scale-95"
                          style={{
                            backgroundColor: isCompleted ? player.color_hex : '#1a1410',
                            border: `2px solid ${player.color_hex}`,
                            boxShadow: isCompleted ? `0 0 6px ${player.color_hex}99` : 'none',
                            opacity: isCompleted ? 1 : 0.5,
                          }}
                        />
                      </form>
                    )
                  })}
                </div>

                {/* Completed by names */}
                {completedBy.length > 0 && (
                  <div className="text-[8px] text-center leading-tight" style={{ color: '#888' }}>
                    {completedBy.map(p => p.name).join(', ')}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
