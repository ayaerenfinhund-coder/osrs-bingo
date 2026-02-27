import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { player_id, tile_id, completed } = await request.json()

  if (!player_id || !tile_id) {
    return NextResponse.json({ error: 'Missing player_id or tile_id' }, { status: 400 })
  }

  const supabase = await createClient()

  if (completed) {
    const { error } = await supabase
      .from('completions')
      .delete()
      .match({ player_id, tile_id })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('completions')
      .insert({ player_id, tile_id })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
