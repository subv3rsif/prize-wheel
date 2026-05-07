'use client'

import { useEffect, useState } from 'react'

interface Segment {
  id: string
  label: string
  color: string
  is_prize: boolean
  display_order: number
}

interface HalfWheelProps {
  segments: Segment[]
  isSpinning: boolean
  targetAngle: number
  spinDuration?: number
}

export function HalfWheel({ segments, isSpinning, targetAngle, spinDuration = 6000 }: HalfWheelProps) {
  const [currentRotation, setCurrentRotation] = useState(0)

  useEffect(() => {
    if (isSpinning) {
      setCurrentRotation(targetAngle)
    }
  }, [isSpinning, targetAngle])

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-white/60 text-xl">Aucun segment disponible</p>
      </div>
    )
  }

  const totalSegments = segments.length
  const anglePerSegment = 360 / totalSegments

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Container with overflow hidden for half-wheel effect */}
      <div className="relative w-full max-w-4xl" style={{ height: '420px', overflow: 'hidden' }}>
        {/* Glow halos behind wheel */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-3xl animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(255,107,53,0.7) 0%, transparent 60%)',
              animationDuration: '3s',
              top: '-150px',
            }}
          />
          <div
            className="absolute w-[650px] h-[650px] rounded-full opacity-20 blur-3xl animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(0,240,255,0.5) 0%, transparent 60%)',
              animationDuration: '4s',
              animationDelay: '0.5s',
              top: '-150px',
            }}
          />
        </div>

        {/* LED lights around the arc */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {Array.from({ length: 16 }, (_, i) => {
            const angle = -180 + (i * 180) / 15 // From -180 to 0 degrees (half circle)
            const distance = 380
            const x = Math.cos((angle * Math.PI) / 180) * distance
            const y = Math.sin((angle * Math.PI) / 180) * distance
            return (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-cyan-400 animate-pulse"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(100% + ${y}px)`,
                  boxShadow: '0 0 20px rgba(0,240,255,0.9), 0 0 40px rgba(0,240,255,0.6)',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '2s',
                }}
              />
            )
          })}
        </div>

        {/* Wheel SVG - positioned at bottom of container */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <svg
            width="700"
            height="700"
            viewBox="0 0 700 700"
            className="drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 50px rgba(255,107,53,0.6)) drop-shadow(0 0 80px rgba(0,240,255,0.4))',
            }}
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="halfNeonRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff006e" />
                <stop offset="33%" stopColor="#ff6b35" />
                <stop offset="66%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#b537f2" />
              </linearGradient>
              <linearGradient id="halfCenterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="50%" stopColor="#b537f2" />
                <stop offset="100%" stopColor="#ff006e" />
              </linearGradient>
              <radialGradient id="halfWheelBg">
                <stop offset="0%" stopColor="#2a1a3e" />
                <stop offset="100%" stopColor="#1a0f2e" />
              </radialGradient>

              {/* Segment shine gradients */}
              {segments.map((segment, index) => (
                <radialGradient
                  key={`shine-${segment.id}`}
                  id={`halfSegmentShine-${index}`}
                  cx="30%"
                  cy="30%"
                >
                  <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              ))}

              {/* Filters */}
              <filter id="halfNeonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <g transform="translate(350, 350)">
              {/* Outer rings */}
              <circle
                cx="0"
                cy="0"
                r="330"
                fill="none"
                stroke="url(#halfNeonRing)"
                strokeWidth="15"
                opacity="0.9"
                filter="url(#halfNeonGlow)"
                strokeDasharray="30 10"
                style={{
                  animation: 'spinRing 30s linear infinite reverse',
                }}
              />
              <circle
                cx="0"
                cy="0"
                r="320"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="8"
                opacity="0.6"
                filter="url(#halfNeonGlow)"
              />

              {/* Wheel background */}
              <circle
                cx="0"
                cy="0"
                r="310"
                fill="url(#halfWheelBg)"
                stroke="#0a0118"
                strokeWidth="8"
              />

              {/* Rotating segments */}
              <g
                style={{
                  transform: `rotate(${currentRotation}deg)`,
                  transformOrigin: 'center',
                  transition: isSpinning
                    ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                    : 'none',
                }}
              >
                {segments.map((segment, index) => {
                  const startAngle = index * anglePerSegment - 90
                  const endAngle = startAngle + anglePerSegment
                  const midAngle = startAngle + anglePerSegment / 2

                  const startRad = (startAngle * Math.PI) / 180
                  const endRad = (endAngle * Math.PI) / 180
                  const midRad = (midAngle * Math.PI) / 180

                  const x1 = Math.cos(startRad) * 305
                  const y1 = Math.sin(startRad) * 305
                  const x2 = Math.cos(endRad) * 305
                  const y2 = Math.sin(endRad) * 305

                  const largeArc = anglePerSegment > 180 ? 1 : 0

                  const textX = Math.cos(midRad) * 220
                  const textY = Math.sin(midRad) * 220

                  const iconX = Math.cos(midRad) * 260
                  const iconY = Math.sin(midRad) * 260

                  return (
                    <g key={segment.id}>
                      {/* Segment base */}
                      <path
                        d={`M 0 0 L ${x1} ${y1} A 305 305 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={segment.color}
                        stroke="#0a0118"
                        strokeWidth="5"
                        style={{
                          filter: segment.is_prize
                            ? 'drop-shadow(0 0 15px rgba(255,238,50,0.6))'
                            : 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
                        }}
                      />

                      {/* Glossy overlay */}
                      <path
                        d={`M 0 0 L ${x1} ${y1} A 305 305 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={`url(#halfSegmentShine-${index})`}
                        pointerEvents="none"
                        opacity="0.5"
                      />

                      {/* Prize star */}
                      {segment.is_prize && (
                        <text
                          x={iconX}
                          y={iconY}
                          fill="#ffee32"
                          fontSize="45"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          filter="url(#halfNeonGlow)"
                          transform={`rotate(${-currentRotation} ${iconX} ${iconY})`}
                        >
                          ★
                        </text>
                      )}

                      {/* Prize icon */}
                      {segment.is_prize && (
                        <text
                          x={iconX}
                          y={iconY}
                          fill="white"
                          fontSize="34"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${-currentRotation} ${iconX} ${iconY})`}
                        >
                          🎁
                        </text>
                      )}

                      {/* Segment label */}
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="18"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontFamily="'Work Sans', sans-serif"
                        transform={`rotate(${-currentRotation} ${textX} ${textY})`}
                        style={{
                          textShadow: '0 0 15px rgba(0,0,0,1), 0 4px 10px rgba(0,0,0,1), 0 0 5px rgba(255,255,255,0.5)',
                          letterSpacing: '0.5px',
                          paintOrder: 'stroke fill',
                          stroke: 'rgba(0,0,0,0.95)',
                          strokeWidth: '4px',
                        }}
                      >
                        {segment.label}
                      </text>
                    </g>
                  )
                })}
              </g>

              {/* Center hub */}
              <circle cx="0" cy="0" r="55" fill="#0a0118" opacity="0.9" />
              <circle
                cx="0"
                cy="0"
                r="48"
                fill="url(#halfCenterGradient)"
                opacity="0.95"
                filter="url(#halfNeonGlow)"
              />
              <circle
                cx="0"
                cy="0"
                r="38"
                fill="#1a0f2e"
                stroke="#00f0ff"
                strokeWidth="3"
                filter="url(#halfNeonGlow)"
              />
              <circle cx="0" cy="0" r="25" fill="#ff006e" filter="url(#halfNeonGlow)" />
              <circle cx="0" cy="0" r="14" fill="#ffee32" />
            </g>
          </svg>
        </div>

        {/* Pointer at top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <div
            className="px-6 py-2 rounded-b-xl text-white font-black text-lg tracking-widest"
            style={{
              background: 'linear-gradient(180deg, #ff006e 0%, #ff6b35 100%)',
              boxShadow: '0 0 30px #ff006e, 0 0 60px rgba(255,0,110,0.5), inset 0 0 15px rgba(255,255,255,0.4)',
              textShadow: '0 0 10px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            ▼ WINNER ▼
          </div>
        </div>
      </div>

      {/* 3D Base platform */}
      <div className="relative w-full max-w-4xl -mt-2">
        <div
          className="w-full h-24 rounded-b-3xl"
          style={{
            background: 'linear-gradient(180deg, #1a0f2e 0%, #0a0118 100%)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 -5px 20px rgba(0,240,255,0.2), inset 0 5px 20px rgba(255,107,53,0.2)',
            border: '3px solid rgba(0,240,255,0.3)',
            borderTop: '3px solid rgba(255,107,53,0.4)',
          }}
        >
          {/* Decorative elements on base */}
          <div className="flex items-center justify-center h-full gap-4">
            <div className="w-16 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 opacity-60" />
            <div className="w-16 h-3 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 opacity-60" />
            <div className="w-16 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-60" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
