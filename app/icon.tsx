import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: 800,
        }}
      >
        W
      </div>
    ),
    {
      ...size,
    }
  )
}
