import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const name = (await params).name
  if (!name) return new NextResponse('Missing name', { status: 400 })

  const isNumeric = /^\d+$/.test(name)
  
  // Hardcoded overrides for broken osrsbox IDs
  const nameOverrides: Record<string, string> = {
    '27238': 'Osmumten%27s_fang.png', // ToA Purple
    '26235': 'Torva_full_helm.png', // Nex Drop
  }

  const finalName = nameOverrides[name] || name
  const useWiki = nameOverrides[name] || !isNumeric

  const url = useWiki
    ? `https://oldschool.runescape.wiki/images/${finalName}`
    : `https://raw.githubusercontent.com/osrsbox/osrsbox-db/master/docs/items-icons/${finalName}.png`
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'OSMBingo/1.0 (https://osmbingo.netlify.app)',
      },
      cache: 'no-store',
    })
    if (!res.ok) return new NextResponse('Not found', { status: 404 })
    const buffer = await res.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') ?? 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse('Failed to fetch icon', { status: 500 })
  }
}
