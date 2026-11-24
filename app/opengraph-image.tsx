import { ImageResponse } from 'next/og'

export const alt = 'WorkGrid — Real-time Collaborative Kanban'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background:
            'linear-gradient(180deg, #1d74e8 0%, #56a8fb 60%, #e6f2ff 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Brand Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1d74e8',
              fontSize: '28px',
              fontWeight: 800,
            }}
          >
            W
          </div>
          <span
            style={{
              color: '#ffffff',
              fontSize: '30px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            WorkGrid
          </span>
          <span
            style={{
              marginLeft: '8px',
              padding: '8px 18px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.22)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            Real-time Collaborative Workspace
          </span>
        </div>

        {/* Center Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            maxWidth: '940px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '62px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.14,
              letterSpacing: '-0.03em',
            }}
          >
            <span>Kelola alur kerja tim secara</span>
            <span style={{ color: '#fde68a' }}>cerah &amp; terstruktur.</span>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.92)',
              lineHeight: 1.4,
            }}
          >
            Kanban Board dengan Supabase Realtime, Optimistic Drag &amp; Drop, dan Multi-Tenant Row Level Security.
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {['Live Sync', 'Multi-Tenant RLS', 'Optimistic DnD', '1-Click Demo'].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.92)',
                  color: '#0f172a',
                  fontSize: '20px',
                  fontWeight: 700,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
