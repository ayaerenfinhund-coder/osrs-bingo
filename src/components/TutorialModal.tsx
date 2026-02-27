'use client'

import { useState, useEffect } from 'react'

export function TutorialModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('osm_bingo_tutorial_seen')) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('osm_bingo_tutorial_seen', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={dismiss}
    >
      <div
        className="relative flex flex-col items-center max-w-sm w-full"
        style={{
          background: '#2e2410',
          border: '4px solid #8a7235',
          boxShadow: '0 0 0 2px #050403, 0 12px 40px rgba(0,0,0,0.9), inset 2px 2px 0 rgba(255,220,100,0.12), inset -1px -1px 0 rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="w-full px-4 py-2 flex items-center justify-center"
          style={{ background: '#1e1608', borderBottom: '2px solid #0a0806' }}
        >
          <h2
            className="text-base tracking-widest uppercase text-center"
            style={{ fontFamily: 'Georgia, serif', color: '#ffb000', textShadow: '1px 1px 0 #000' }}
          >
            ⚔ How to Play ⚔
          </h2>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-[3px] w-full p-[5px]">
          {[
            {
              icon: '👤',
              title: 'Choose your player',
              desc: 'Tap your name from the buttons above the board to select yourself.',
            },
            {
              icon: '🟩',
              title: 'Mark a tile',
              desc: 'Tap any tile to toggle it as completed for your player.',
            },
            {
              icon: '✋',
              title: 'Clear a tile',
              desc: 'Hold (long-press) a tile to remove a completion from it.',
            },
            {
              icon: '🏆',
              title: 'Leaderboard',
              desc: 'Progress is tracked live — see who\'s ahead in the leaderboard below.',
            },
          ].map(step => (
            <div
              key={step.title}
              className="flex items-start gap-3 px-3 py-2"
              style={{
                background: '#3a2e1c',
                borderTop: '2px solid #6a5830',
                borderLeft: '2px solid #6a5830',
                borderRight: '2px solid #080604',
                borderBottom: '2px solid #080604',
                boxShadow: 'inset 1px 1px 0 rgba(255,220,100,0.08), inset -1px -1px 0 rgba(0,0,0,0.4)',
              }}
            >
              <span className="text-xl shrink-0 leading-none mt-0.5">{step.icon}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold font-sans" style={{ color: '#ffb000', textShadow: '1px 1px 0 #000' }}>
                  {step.title}
                </span>
                <span className="text-xs font-sans leading-snug" style={{ color: '#c8a84b', textShadow: '1px 1px 0 #000' }}>
                  {step.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dismiss button */}
        <div className="w-full p-[5px] pt-0">
          <button
            onClick={dismiss}
            className="w-full py-2 text-sm font-sans tracking-widest uppercase osrs-btn"
            style={{ color: '#ffb000', textShadow: '1px 1px 0 #000', fontSize: '13px' }}
          >
            ▶ Let&apos;s Go!
          </button>
        </div>
      </div>
    </div>
  )
}
