import { ImageResponse } from 'next/og'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: '#020202',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#E50914',
          borderRadius: '8px',
          border: '1px solid #333',
        }}
      >
        {/* Simple SVG Play Icon using CSS shapes or text */}
        <div
            style={{
                width: 0, 
                height: 0, 
                borderLeft: '12px solid #E50914',
                borderTop: '7px solid transparent',
                borderBottom: '7px solid transparent',
                marginLeft: '4px' // Optical center
            }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
