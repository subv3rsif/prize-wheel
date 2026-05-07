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
      {/* Fixed pointer at top */}
      <div
        className="absolute top-4 z-20"
        style={{
          width: 0,
          height: 0,
          borderLeft: '20px solid transparent',
          borderRight: '20px solid transparent',
          borderTop: '40px solid #ef4444',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
        }}
      />

      {/* Wheel SVG */}
      <svg
        width="600"
        height="600"
        viewBox="0 0 600 600"
        className="max-w-full h-auto transform-gpu"
        style={{
          transform: `rotate(${currentRotation}deg)`,
          transition: isSpinning
            ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
            : 'none',
        }}
      >
        {/* Background circle */}
        <circle
          cx="300"
          cy="300"
          r="290"
          fill="var(--wheel-bg)"
          stroke="#f59e0b"
          strokeWidth="10"
          filter="drop-shadow(0 10px 30px rgba(0,0,0,0.3))"
        />

        {/* Segments */}
        {segments.map((segment, index) => {
          const startAngle = index * anglePerSegment
          const endAngle = startAngle + anglePerSegment
          const midAngle = startAngle + anglePerSegment / 2

          return (
            <g key={segment.id}>
              {/* Arc segment */}
              <path
                d={describeArc(300, 300, 280, startAngle, endAngle)}
                fill={segment.color}
                stroke="white"
                strokeWidth="3"
                opacity={segment.is_prize ? 1 : 0.9}
              />

              {/* Prize icon */}
              {segment.is_prize && (
                <text
                  x="300"
                  y="300"
                  fill="white"
                  fontSize="32"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle} 300 300) translate(0 -220)`}
                >
                  🎁
                </text>
              )}

              {/* Segment label */}
              <text
                x="300"
                y="300"
                fill="var(--segment-text-color)"
                fontSize="18"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${midAngle} 300 300) translate(0 ${segment.is_prize ? -180 : -200})`}
              >
                {segment.label}
              </text>
            </g>
          )
        })}

        {/* Center pin */}
        <circle cx="300" cy="300" r="35" fill="#1f2937" />
        <circle cx="300" cy="300" r="25" fill="#f59e0b" />
        <circle cx="300" cy="300" r="15" fill="white" />

        {/* Decorative border */}
        <circle
          cx="300"
          cy="300"
          r="290"
          fill="none"
          stroke="url(#festiveGradient)"
          strokeWidth="6"
          strokeDasharray="10 5"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="festiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
