'use client'

import { useEffect, useState } from 'react'

interface Segment {
  id: string
  label: string
  color: string
  is_prize: boolean
  display_order: number
}

interface WheelProps {
  segments: Segment[]
  isSpinning: boolean
  targetAngle: number
  spinDuration?: number
}

export function Wheel({ segments, isSpinning, targetAngle, spinDuration = 6000 }: WheelProps) {
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
    <div className="relative flex items-center justify-center p-8">
      {/* Massive glow halos behind wheel */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          className="absolute w-[700px] h-[700px] rounded-full opacity-40 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,53,0.8) 0%, transparent 60%)',
            animationDuration: '3s',
          }}
        />
        <div
          className="absolute w-[750px] h-[750px] rounded-full opacity-30 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(0,240,255,0.6) 0%, transparent 60%)',
            animationDuration: '4s',
            animationDelay: '0.5s',
          }}
        />
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,110,0.5) 0%, transparent 60%)',
            animationDuration: '5s',
            animationDelay: '1s',
          }}
        />
      </div>

      {/* Fixed pointer at top - enhanced with neon */}
      <div className="absolute top-2 z-30 flex flex-col items-center">
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '28px solid transparent',
            borderRight: '28px solid transparent',
            borderTop: '56px solid #ff006e',
            filter: 'drop-shadow(0 0 15px #ff006e) drop-shadow(0 0 30px #ff006e) drop-shadow(0 6px 10px rgba(0,0,0,0.7))',
          }}
        />
        <div
          className="mt-3 px-5 py-2 rounded-full text-white font-black text-base tracking-widest animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #ff006e 0%, #ff6b35 100%)',
            boxShadow: '0 0 30px #ff006e, 0 0 60px rgba(255,0,110,0.5), inset 0 0 15px rgba(255,255,255,0.4)',
            textShadow: '0 0 10px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          ★ WINNER ★
        </div>
      </div>

      {/* Wheel container with glow */}
      <div className="relative z-10">
        <svg
          width="650"
          height="650"
          viewBox="0 0 650 650"
          className="drop-shadow-2xl"
          style={{
            filter: 'drop-shadow(0 0 50px rgba(255,107,53,0.6)) drop-shadow(0 0 100px rgba(0,240,255,0.4)) drop-shadow(0 20px 60px rgba(0,0,0,0.6))',
          }}
        >
          <defs>
            {/* Neon gradients */}
            <linearGradient id="neonRing1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff006e" stopOpacity="1" />
              <stop offset="33%" stopColor="#ff6b35" stopOpacity="1" />
              <stop offset="66%" stopColor="#00f0ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#b537f2" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#b537f2" />
              <stop offset="100%" stopColor="#ff006e" />
            </linearGradient>
            <radialGradient id="wheelBg">
              <stop offset="0%" stopColor="#2a1a3e" />
              <stop offset="100%" stopColor="#1a0f2e" />
            </radialGradient>

            {/* Glow filter */}
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Strong inner shadow */}
            <filter id="innerShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
              <feOffset dx="0" dy="3" result="offsetblur"/>
              <feFlood floodColor="#000000" floodOpacity="0.6"/>
              <feComposite in2="offsetblur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <g transform="translate(325, 325)">
            {/* Outer neon ring - animated */}
            <circle
              cx="0"
              cy="0"
              r="310"
              fill="none"
              stroke="url(#neonRing1)"
              strokeWidth="12"
              opacity="0.9"
              filter="url(#neonGlow)"
              strokeDasharray="20 10"
              style={{
                animation: 'spinRing 30s linear infinite reverse',
              }}
            />

            {/* Secondary ring */}
            <circle
              cx="0"
              cy="0"
              r="302"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="6"
              opacity="0.5"
              filter="url(#neonGlow)"
            />

            {/* Main wheel background */}
            <circle
              cx="0"
              cy="0"
              r="295"
              fill="url(#wheelBg)"
              stroke="#0a0118"
              strokeWidth="8"
              filter="url(#innerShadow)"
            />

            {/* Rotating segments group */}
            <g
              style={{
                transform: `rotate(${currentRotation}deg)`,
                transformOrigin: 'center',
                transition: isSpinning
                  ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                  : 'none',
              }}
            >
              {/* Segments */}
              {segments.map((segment, index) => {
                const startAngle = index * anglePerSegment - 90
                const endAngle = startAngle + anglePerSegment
                const midAngle = startAngle + anglePerSegment / 2

                const startRad = (startAngle * Math.PI) / 180
                const endRad = (endAngle * Math.PI) / 180
                const midRad = (midAngle * Math.PI) / 180

                const x1 = Math.cos(startRad) * 290
                const y1 = Math.sin(startRad) * 290
                const x2 = Math.cos(endRad) * 290
                const y2 = Math.sin(endRad) * 290

                const largeArc = anglePerSegment > 180 ? 1 : 0

                const textX = Math.cos(midRad) * 200
                const textY = Math.sin(midRad) * 200

                const iconX = Math.cos(midRad) * 235
                const iconY = Math.sin(midRad) * 235

                return (
                  <g key={segment.id}>
                    {/* Segment path */}
                    <path
                      d={`M 0 0 L ${x1} ${y1} A 290 290 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      stroke="#0a0118"
                      strokeWidth="5"
                      opacity={segment.is_prize ? 1 : 0.9}
                      style={{
                        filter: segment.is_prize
                          ? 'drop-shadow(0 0 12px rgba(255,238,50,0.4))'
                          : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      }}
                    />

                    {/* Prize star background */}
                    {segment.is_prize && (
                      <text
                        x={iconX}
                        y={iconY}
                        fill="#ffee32"
                        fontSize="40"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        filter="url(#neonGlow)"
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
                        fontSize="30"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${-currentRotation} ${iconX} ${iconY})`}
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                        }}
                      >
                        🎁
                      </text>
                    )}

                    {/* Segment label - counter-rotated to stay horizontal */}
                    <text
                      x={textX}
                      y={textY}
                      fill="white"
                      fontSize="16"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="'Work Sans', sans-serif"
                      transform={`rotate(${-currentRotation} ${textX} ${textY})`}
                      style={{
                        textShadow: '0 0 15px rgba(0,0,0,1), 0 4px 10px rgba(0,0,0,1), 0 0 5px rgba(255,255,255,0.5), 0 0 25px rgba(0,0,0,0.9)',
                        letterSpacing: '0.5px',
                        paintOrder: 'stroke fill',
                        stroke: 'rgba(0,0,0,0.95)',
                        strokeWidth: '4px',
                        strokeLinejoin: 'round',
                      }}
                    >
                      {segment.label}
                    </text>
                  </g>
                )
              })}
            </g>

            {/* Center hub - layered */}
            <circle cx="0" cy="0" r="50" fill="#0a0118" opacity="0.8" />
            <circle
              cx="0"
              cy="0"
              r="45"
              fill="url(#centerGradient)"
              opacity="0.95"
              filter="url(#neonGlow)"
            />
            <circle
              cx="0"
              cy="0"
              r="35"
              fill="#1a0f2e"
              stroke="#00f0ff"
              strokeWidth="3"
              filter="url(#neonGlow)"
            />
            <circle
              cx="0"
              cy="0"
              r="22"
              fill="#ff006e"
              filter="url(#neonGlow)"
            />
            <circle
              cx="0"
              cy="0"
              r="12"
              fill="#ffee32"
            />
          </g>
        </svg>
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
