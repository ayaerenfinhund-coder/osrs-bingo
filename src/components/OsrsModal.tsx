'use client'

interface OsrsModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function OsrsModal({
  title,
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  onConfirm,
  onCancel,
  danger = false,
}: OsrsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        className="w-full max-w-xs flex flex-col"
        style={{
          background: '#ba9e63',
          border: '3px solid #7a5f32',
          boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.8)',
        }}
      >
        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{
            background: 'rgba(0,0,0,0.2)',
            borderBottom: '2px solid #7a5f32',
          }}
        >
          <span className="text-lg">{danger ? '⚠️' : '📜'}</span>
          <h2
            className="text-sm font-black tracking-wide uppercase flex-1"
            style={{ color: '#2a1f0a' }}
          >
            {title}
          </h2>
        </div>

        <div className="px-4 py-4">
          <p
            className="text-sm font-bold text-center leading-snug"
            style={{ color: '#2a1f0a', textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}
          >
            {message}
          </p>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 font-black text-sm uppercase tracking-wide transition-all active:scale-95 hover:brightness-110"
            style={{
              background: danger ? '#7a1a1a' : '#2a4a1a',
              color: danger ? '#ffaaaa' : '#aaffaa',
              border: `2px solid ${danger ? '#4a0a0a' : '#1a3a0a'}`,
              boxShadow: `inset 1px 1px 0 rgba(255,255,255,0.2), inset -1px -1px 0 rgba(0,0,0,0.4)`,
              textShadow: '1px 1px 0 rgba(0,0,0,0.8)',
            }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 font-black text-sm uppercase tracking-wide transition-all active:scale-95 hover:brightness-110"
            style={{
              background: '#3a2e1a',
              color: '#c8a84b',
              border: '2px solid #2a1f0a',
              boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.1), inset -1px -1px 0 rgba(0,0,0,0.4)',
              textShadow: '1px 1px 0 rgba(0,0,0,0.8)',
            }}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
