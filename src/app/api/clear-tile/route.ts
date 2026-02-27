import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { tile_id } = await request.json()

  if (!tile_id) {
    return NextResponse.json({ error: 'Missing tile_id' }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('completions')
    .delete()
    .match({ tile_id })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
