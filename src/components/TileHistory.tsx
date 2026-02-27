'use client'

import { useEffect, useState } from 'react'

interface HistoryEntry {
  id: string
  playerName: string
  playerColor: string
  tileName: string
  action: 'completed' | 'removed'
  timestamp: Date
}

interface TileHistoryProps {
  entries: HistoryEntry[]
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function TileHistory({ entries }: TileHistoryProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  if (entries.length === 0) return null

  return (
    <div className="w-full max-w-6xl mt-2 px-1">
      <div
        className="w-full px-3 py-2"
        style={{
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(90, 64, 16, 0.5)',
        }}
      >
        <div className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#c8a86b' }}>
          Recent Activity
        </div>
        <div className="flex flex-col gap-0.5">
          {entries.slice(0, 8).map((entry) => (
            <div key={entry.id} className="flex items-center gap-1 text-[10px]" style={{ color: '#b89a6a' }}>
              <div
                className="w-1.5 h-1.5 rotate-45 shrink-0"
                style={{ backgroundColor: entry.playerColor, border: '1px solid rgba(0,0,0,0.4)' }}
              />
              <span className="font-semibold" style={{ color: entry.playerColor }}>{entry.playerName}</span>
              <span>{entry.action === 'completed' ? 'completed' : 'removed'}</span>
              <span className="truncate max-w-[120px] sm:max-w-xs opacity-80">{entry.tileName}</span>
              <span className="ml-auto shrink-0 text-[9px] opacity-60 whitespace-nowrap">{formatTime(entry.timestamp)} · {timeAgo(entry.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export type { HistoryEntry }
