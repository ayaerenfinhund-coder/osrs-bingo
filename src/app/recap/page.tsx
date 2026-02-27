import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RecapPage } from '@/components/RecapPage'

export const revalidate = 0

export default async function Recap() {
  const RECAP_UNLOCK = new Date('2026-03-25T00:00:00+01:00')
  if (new Date() < RECAP_UNLOCK) {
    redirect('/')
  }

  const supabase = await createClient()
  const [{ data: players }, { data: tiles }, { data: completions }] = await Promise.all([
    supabase.from('players').select('*').order('id'),
    supabase.from('tiles').select('*').order('index'),
    supabase.from('completions').select('*').order('created_at'),
  ])

  if (!players || !tiles || !completions) redirect('/')

  return <RecapPage players={players} tiles={tiles} completions={completions} />
}
