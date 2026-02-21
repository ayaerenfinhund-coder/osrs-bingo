import Image from 'next/image'
import { Database } from '@/lib/database.types'

type Tile = Database['public']['Tables']['tiles']['Row']
type Player = Database['public']['Tables']['players']['Row']

interface BingoTileProps {
  tile: Tile
  completedBy: Player[]
  allPlayers?: Player[]
  onClick?: () => void
  isAdmin?: boolean
}

export function BingoTile({ tile, completedBy, allPlayers, onClick, isAdmin }: BingoTileProps) {
  const totalPlayers = allPlayers?.length ?? 6
  const isFullyComplete = completedBy.length === totalPlayers
  const isPartiallyComplete = completedBy.length > 0

  return (
    <div
      onClick={onClick}
      className={[
        'relative flex flex-col items-center justify-between p-1.5 text-center select-none transition-all duration-150 overflow-hidden',
        'min-h-[90px] sm:min-h-[110px] md:min-h-[120px]',
        isFullyComplete ? 'osrs-tile-completed' : 'osrs-tile',
        isAdmin ? 'cursor-pointer hover:brightness-125 active:scale-95' : '',
      ].join(' ')}
    >
      {/* Completion glow border */}
      {isFullyComplete && (
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 12px rgba(0,200,0,0.25)' }} />
      )}
      {isPartiallyComplete && !isFullyComplete && (
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 8px rgba(200,168,75,0.15)' }} />
      )}

      {/* Task Name */}
      <div
        className="w-full text-[9px] sm:text-[10px] leading-tight font-bold text-center px-0.5"
        style={{
          color: isFullyComplete ? '#00ff00' : '#ffff00',
          textShadow: '1px 1px 0 #000',
        }}
      >
        {tile.task_name}
      </div>

      {/* Icon */}
      <div className="relative flex-1 flex items-center justify-center w-full my-0.5">
        {tile.icon_id ? (
          <div className="relative w-10 h-10 sm:w-12 sm:h-12">
            <Image
              src={`https://oldschool.runescape.wiki/images/${encodeURIComponent(tile.icon_id)}`}
              alt={tile.task_name}
              fill
              className="object-contain image-pixelated"
              unoptimized
              style={{ filter: isFullyComplete ? 'drop-shadow(0 0 4px rgba(0,255,0,0.6))' : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}
            />
          </div>
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-2xl opacity-40">?</div>
        )}
      </div>

      {/* Participant Orbs */}
      <div className="flex flex-wrap justify-center gap-[2px] w-full min-h-[10px]">
        {completedBy.map((player) => (
          <div
            key={player.id}
            title={player.name}
            className="w-2 h-2 rounded-sm border border-black/60"
            style={{
              backgroundColor: player.color_hex,
              boxShadow: `0 0 3px ${player.color_hex}88`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
