'use client'

import { useState, useEffect } from 'react'

interface CountdownProps {
  targetDate: string
  endDate?: string
}

function useTimeLeft(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const targetTime = new Date(targetDate).getTime()
    const calculate = () => {
      const diff = targetTime - new Date().getTime()
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        })
      } else {
        setTimeLeft(null)
      }
    }
    calculate()
    const interval = setInterval(calculate, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}

function CountdownDisplay({ timeLeft }: { timeLeft: { days: number; hours: number; minutes: number; seconds: number } }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-1"
      style={{
        background: 'rgba(0,0,0,0.12)',
        border: '2px solid #382418',
        boxShadow: 'inset 1px 1px 0px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex flex-col items-center gap-0">
        <span className="text-base sm:text-lg" style={{ color: '#ff981f', fontFamily: 'Georgia, serif', textShadow: '1px 1px 0 #000' }}>{timeLeft.days}</span>
        <span className="text-[9px] uppercase osrs-pixel-text" style={{ color: '#c0a071' }}>d</span>
      </div>
      <span className="text-base pb-2 osrs-pixel-text" style={{ color: '#6b5a3e' }}>:</span>
      <div className="flex flex-col items-center gap-0">
        <span className="text-base sm:text-lg osrs-pixel-text" style={{ color: '#ff981f', fontFamily: 'Georgia, serif' }}>{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-[9px] uppercase osrs-pixel-text" style={{ color: '#c0a071' }}>h</span>
      </div>
      <span className="text-base pb-2 osrs-pixel-text" style={{ color: '#6b5a3e' }}>:</span>
      <div className="flex flex-col items-center gap-0">
        <span className="text-base sm:text-lg osrs-pixel-text" style={{ color: '#ff981f', fontFamily: 'Georgia, serif' }}>{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span className="text-[9px] uppercase osrs-pixel-text" style={{ color: '#c0a071' }}>m</span>
      </div>
      <span className="text-base pb-2 osrs-pixel-text" style={{ color: '#6b5a3e' }}>:</span>
      <div className="flex flex-col items-center gap-0">
        <span className="text-base sm:text-lg osrs-pixel-text" style={{ color: '#ff981f', fontFamily: 'Georgia, serif' }}>{timeLeft.seconds.toString().padStart(2, '0')}</span>
        <span className="text-[9px] uppercase osrs-pixel-text" style={{ color: '#c0a071' }}>s</span>
      </div>
    </div>
  )
}

export function Countdown({ targetDate, endDate }: CountdownProps) {
  const startTimeLeft = useTimeLeft(targetDate)
  const endTimeLeft = endDate ? useTimeLeft(endDate) : null

  const hasStarted = !startTimeLeft
  const hasEnded = endDate ? !endTimeLeft : false

  if (hasEnded) {
    return (
      <div className="flex items-center justify-center gap-2 px-3 py-1 mt-1" style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(140, 110, 60, 0.4)' }}>
        <span className="text-xs font-bold" style={{ color: '#8b2020' }}>BINGO HAS ENDED!</span>
      </div>
    )
  }

  if (!hasStarted && startTimeLeft) {
    return (
      <div className="flex items-center justify-center mt-0.5">
        <CountdownDisplay timeLeft={startTimeLeft} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1 mt-1">
      <div className="px-4 py-1.5" style={{ background: 'rgba(0,0,0,0.12)', border: '2px solid #382418', boxShadow: 'inset 1px 1px 0px rgba(0,0,0,0.5)' }}>
        <span className="text-xs font-sans tracking-widest uppercase" style={{ color: '#00c800', textShadow: '1px 1px 0 #000' }}>✦ BINGO IS LIVE! ✦</span>
      </div>
      {endDate && endTimeLeft && (
        <div className="flex flex-col items-center mt-1" style={{ opacity: 0.7 }}>
          <div className="text-[10px] mb-1 uppercase tracking-widest osrs-pixel-text" style={{ color: '#382418', textShadow: '1px 1px 0 #c8a84b' }}>ENDS IN:</div>
          <div
            className="flex items-center gap-2 px-3 py-1"
            style={{
              background: 'rgba(0,0,0,0.12)',
              border: '2px solid #382418',
              boxShadow: 'inset 1px 1px 0px rgba(0,0,0,0.5)',
            }}
          >
            <span className="text-sm font-sans" style={{ color: '#ff981f', textShadow: '1px 1px 0 #000' }}>{endTimeLeft.days}d</span>
            <span className="text-sm" style={{ color: '#6b5a3e', textShadow: '1px 1px 0 #000' }}>:</span>
            <span className="text-sm font-sans" style={{ color: '#ff981f', textShadow: '1px 1px 0 #000' }}>{endTimeLeft.hours.toString().padStart(2, '0')}h</span>
            <span className="text-sm" style={{ color: '#6b5a3e', textShadow: '1px 1px 0 #000' }}>:</span>
            <span className="text-sm font-sans" style={{ color: '#ff981f', textShadow: '1px 1px 0 #000' }}>{endTimeLeft.minutes.toString().padStart(2, '0')}m</span>
            <span className="text-sm" style={{ color: '#6b5a3e', textShadow: '1px 1px 0 #000' }}>:</span>
            <span className="text-sm font-sans" style={{ color: '#ff981f', textShadow: '1px 1px 0 #000' }}>{endTimeLeft.seconds.toString().padStart(2, '0')}s</span>
          </div>
        </div>
      )}
    </div>
  )
}
