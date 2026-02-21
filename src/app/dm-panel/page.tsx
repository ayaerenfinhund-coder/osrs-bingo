import { createClient } from '@/lib/supabase/server'
import { AdminPanel } from './AdminPanel'

export default async function DMPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const key = resolvedSearchParams.key
  const adminKey = process.env.ADMIN_KEY ?? ''

  if (key !== adminKey) {
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
          <p className="text-sm" style={{ color: '#aaa' }}>
            Provide the correct admin key via <code style={{ color: '#c8a84b' }}>?key=...</code>
          </p>
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
    <AdminPanel
      players={players}
      tiles={tiles}
      initialCompletions={completions}
      adminKey={adminKey}
    />
  )
}
