import { memo, useRef, useCallback } from 'react'
import { Database } from '@/lib/database.types'

type Tile = Database['public']['Tables']['tiles']['Row']
type Player = Database['public']['Tables']['players']['Row']

interface BingoTileProps {
  tile: Tile
  completedBy: Player[]
  allPlayers?: Player[]
  onClick?: () => void
  onLongPress?: () => void
  isEditable?: boolean
  isSelectedPlayerCompleted?: boolean
}

export const BingoTile = memo(function BingoTile({ tile, completedBy, allPlayers, onClick, onLongPress, isEditable, isSelectedPlayerCompleted }: BingoTileProps) {
  const isFullyComplete = completedBy.length > 0
  const isPartiallyComplete = false
  
  const timerRef = useRef<NodeJS.Timeout>(null)
  const isLongPress = useRef(false)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const didScroll = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    isLongPress.current = false
    didScroll.current = false
    if ('touches' in e) {
      touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else {
      touchStartPos.current = { x: e.clientX, y: e.clientY }
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      isLongPress.current = true
      if (onLongPress) {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50)
        }
        onLongPress()
      }
    }, 600)
  }, [onLongPress])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current) return
    const dx = e.touches[0].clientX - touchStartPos.current.x
    const dy = e.touches[0].clientY - touchStartPos.current.y
    if (Math.sqrt(dx * dx + dy * dy) > 8) {
      didScroll.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!isLongPress.current && !didScroll.current && onClick) {
      onClick()
    }
    touchStartPos.current = null
  }, [onClick])

  const handleTouchCancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    isLongPress.current = false
    didScroll.current = false
    touchStartPos.current = null
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <div
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchCancel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onContextMenu={handleContextMenu}
      className={[
        'relative flex flex-col items-center justify-between p-0.5 text-center select-none transition-[opacity,transform]',
        'min-h-[95px] sm:min-h-[125px]',
        isFullyComplete ? 'osrs-tile-completed-inner' : isPartiallyComplete ? 'osrs-tile-partial-inner' : 'osrs-tile-inner',
        'cursor-pointer hover:opacity-90',
        isEditable ? 'active:scale-95' : '',
        isEditable && !isSelectedPlayerCompleted ? 'ring-2 ring-inset ring-white/50 hover:ring-white/80' : '',
        isEditable && isSelectedPlayerCompleted ? 'ring-2 ring-inset ring-red-500/50 hover:ring-red-500/80' : '',
      ].join(' ')}
    >
      <div
          className="w-full text-[10px] sm:text-[11px] leading-tight text-center px-1 pt-1 pb-0.5 font-semibold"
        style={{
          color: isFullyComplete ? '#7fff7f' : '#c8a84b',
          textShadow: '1px 1px 0 #000',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto',
        }}
      >
        {tile.task_name}
      </div>

      <div className="flex-1 flex items-center justify-center w-full px-1 py-0.5">
        {tile.icon_id ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/icon/${tile.icon_id}`}
            alt={tile.task_name}
            className="image-pixelated object-contain"
            style={{
              width: 'clamp(28px, 5.5vw, 44px)',
              height: 'clamp(28px, 5.5vw, 44px)',
              maxWidth: '100%',
              filter: isFullyComplete
                ? 'drop-shadow(0 0 4px rgba(0,200,0,0.5))'
                : 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
            }}
          />
        ) : (
          <div className="w-6 h-6 flex items-center justify-center text-sm opacity-30" style={{ color: '#3a2b12' }}>?</div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-[2px] w-full px-0.5 pb-0.5">
        {completedBy.map((player) => (
          <div
            key={player.id}
            title={player.name}
            className="flex items-center gap-[3px] px-[3px] py-[1px]"
            style={{
              backgroundColor: 'rgba(25, 20, 15, 0.85)',
              border: `1px solid rgba(140, 110, 60, 0.3)`,
            }}
          >
            <div 
              className="w-1.5 h-1.5 rotate-45 shrink-0" 
              style={{
                backgroundColor: player.color_hex,
                border: '1px solid rgba(0,0,0,0.5)',
              }} 
            />
            <span className="leading-none font-sans" style={{ fontSize: '9px', color: player.color_hex, textShadow: '1px 1px 0 #000', whiteSpace: 'nowrap' }}>
              {player.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
