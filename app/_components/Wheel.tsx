'use client'

import { useEffect, useState } from 'react'
import { describeArc } from '@/lib/utils/wheel-calculations'

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
        <p className="text-gray-500">Aucun segment disponible</p>
      </div>
    )
  }

  const totalSegments = segments.length
  const anglePerSegment = 360 / totalSegments

  return (
    <div className="relative flex items-center justify-center p-8">
      {/* Glow halos behind wheel */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="absolute w-[650px] h-[650px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,53,0.6) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute w-[700px] h-[700px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0,240,255,0.4) 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Fixed pointer at top - enhanced with neon */}
      <div className="absolute top-4 z-20 flex flex-col items-center">
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '24px solid transparent',
            borderRight: '24px solid transparent',
            borderTop: '48px solid #ff006e',
            filter: 'drop-shadow(0 0 10px #ff006e) drop-shadow(0 0 20px #ff006e) drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
          }}
        />
        <div
          className="mt-2 px-4 py-1 rounded-full text-white font-bold text-sm tracking-wider"
          style={{
            background: '#ff006e',
            boxShadow: '0 0 20px #ff006e, inset 0 0 10px rgba(255,255,255,0.3)',
          }}
        >
          WINNER
        </div>
      </div>

      {/* Wheel SVG */}
      <svg
        width="600"
        height="600"
        viewBox="0 0 600 600"
        className="max-w-full h-auto transform-gpu wheel-glow"
        style={{
          transform: `rotate(${currentRotation}deg)`,
          transition: isSpinning
            ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
            : 'none',
        }}
      >
        <defs>
          {/* Gradients for neon effect */}
          <linearGradient id="neonGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff006e" />
            <stop offset="50%" stopColor="#ff6b35" />
            <stop offset="100%" stopColor="#00f0ff" />
          </linearGradient>
          <linearGradient id="neonGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="50%" stopColor="#b537f2" />
            <stop offset="100%" stopColor="#ff006e" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="innerShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer decorative ring */}
        <circle
          cx="300"
          cy="300"
          r="295"
          fill="none"
          stroke="url(#neonGradient1)"
          strokeWidth="8"
          opacity="0.8"
          filter="url(#glow)"
        />

        {/* Background circle */}
        <circle
          cx="300"
          cy="300"
          r="285"
          fill="#1a0f2e"
          stroke="#00f0ff"
          strokeWidth="4"
          filter="url(#innerShadow)"
        />

        {/* Segments */}
        {segments.map((segment, index) => {
          const startAngle = index * anglePerSegment
          const endAngle = startAngle + anglePerSegment
          const midAngle = startAngle + anglePerSegment / 2

          return (
            <g key={segment.id}>
              {/* Arc segment with enhanced styling */}
              <path
                d={describeArc(300, 300, 278, startAngle, endAngle)}
                fill={segment.color}
                stroke="#0a0118"
                strokeWidth="4"
                opacity={segment.is_prize ? 1 : 0.85}
                style={{
                  filter: segment.is_prize
                    ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
                    : 'none',
                }}
              />

              {/* Prize icon with glow */}
              {segment.is_prize && (
                <g>
                  <text
                    x="300"
                    y="300"
                    fill="#ffee32"
                    fontSize="38"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle} 300 300) translate(0 -215)`}
                    filter="url(#glow)"
                  >
                    ★
                  </text>
                  <text
                    x="300"
                    y="300"
                    fill="white"
                    fontSize="28"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle} 300 300) translate(0 -215)`}
                  >
                    🎁
                  </text>
                </g>
              )}

              {/* Segment label with better contrast */}
              <text
                x="300"
                y="300"
                fill="white"
                fontSize="16"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="Work Sans, sans-serif"
                transform={`rotate(${midAngle} 300 300) translate(0 ${segment.is_prize ? -175 : -195})`}
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)',
                  letterSpacing: '0.5px',
                }}
              >
                {segment.label}
              </text>
            </g>
          )
        })}

        {/* Center pin with neon styling */}
        <circle cx="300" cy="300" r="42" fill="#0a0118" filter="url(#glow)" />
        <circle
          cx="300"
          cy="300"
          r="35"
          fill="url(#neonGradient2)"
          opacity="0.9"
        />
        <circle
          cx="300"
          cy="300"
          r="25"
          fill="#1a0f2e"
          stroke="#00f0ff"
          strokeWidth="2"
        />
        <circle cx="300" cy="300" r="15" fill="#ff006e" filter="url(#glow)" />
        <circle cx="300" cy="300" r="8" fill="#ffee32" />

        {/* Animated decorative border */}
        <circle
          cx="300"
          cy="300"
          r="290"
          fill="none"
          stroke="url(#neonGradient1)"
          strokeWidth="3"
          strokeDasharray="15 10"
          opacity="0.6"
          style={{
            animation: isSpinning ? 'none' : 'spin 20s linear infinite reverse',
          }}
        />
      </svg>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
