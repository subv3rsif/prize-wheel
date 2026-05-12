'use client'

import { useEffect, useState } from 'react'

interface Segment {
  id: string
  label: string
  color: string
  is_prize: boolean
  display_order: number
}

interface PremiumHalfWheelProps {
  segments: Segment[]
  isSpinning: boolean
  targetAngle: number
  spinDuration?: number
}

export function PremiumHalfWheel({ segments, isSpinning, targetAngle, spinDuration = 6000 }: PremiumHalfWheelProps) {
  const [currentRotation, setCurrentRotation] = useState(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    if (isSpinning) {
      setCurrentRotation(targetAngle)
    }
  }, [isSpinning, targetAngle])

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }))
    setParticles(newParticles)
  }, [])

  if (segments.length === 0) {
    return null
  }

  const totalSegments = segments.length
  const anglePerSegment = 360 / totalSegments

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Floating golden particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: 'radial-gradient(circle, #ffd700 0%, transparent 70%)',
            animation: `float ${3 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            opacity: 0.6,
            boxShadow: '0 0 10px rgba(255,215,0,0.8)',
          }}
        />
      ))}

      {/* Rotating light rays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              width: '600px',
              height: '2px',
              background: `linear-gradient(90deg, rgba(255,215,0,0.8) 0%, transparent 100%)`,
              transform: `rotate(${i * 30}deg)`,
              animation: 'rotateRay 8s linear infinite',
              animationDelay: `${i * 0.1}s`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* Main wheel container */}
      <div className="relative w-full max-w-5xl" style={{ height: '500px', overflow: 'hidden' }}>
        {/* Massive glow backdrop */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,105,180,0.4) 50%, transparent 70%)',
              top: '-200px',
              animation: 'pulse 4s ease-in-out infinite',
            }}
          />
        </div>

        {/* LED lights - premium pulsing effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {Array.from({ length: 18 }, (_, i) => {
            const angle = -180 + (i * 180) / 17
            const distance = 440
            const x = Math.cos((angle * Math.PI) / 180) * distance
            const y = Math.sin((angle * Math.PI) / 180) * distance
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(100% + ${y}px)`,
                }}
              >
                {/* LED glow */}
                <div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,215,0,0.6) 50%, transparent 70%)',
                    animation: `ledPulse ${1.5 + Math.random() * 0.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
                {/* LED core */}
                <div
                  className="relative w-5 h-5 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #fff 0%, #ffd700 100%)',
                    boxShadow: '0 0 25px rgba(255,215,0,1), inset 0 0 10px rgba(255,255,255,0.8)',
                    animation: `ledPulse ${1.5 + Math.random() * 0.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Wheel SVG */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <svg
            width="800"
            height="800"
            viewBox="0 0 800 800"
            style={{
              filter: 'drop-shadow(0 0 60px rgba(255,215,0,0.5)) drop-shadow(0 20px 80px rgba(0,0,0,0.6))',
              transformBox: 'fill-box',
            }}
          >
            <defs>
              {/* Premium gradients */}
              <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="50%" stopColor="#ffed4e" />
                <stop offset="100%" stopColor="#ffa500" />
              </linearGradient>
              <radialGradient id="wheelBgPremium">
                <stop offset="0%" stopColor="#1a0a2e" />
                <stop offset="100%" stopColor="#0d0416" />
              </radialGradient>
              <linearGradient id="centerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="50%" stopColor="#ff1493" />
                <stop offset="100%" stopColor="#8b00ff" />
              </linearGradient>

              {/* Shine gradients for segments */}
              {segments.map((_, index) => (
                <radialGradient
                  key={`shine-${index}`}
                  id={`premiumShine-${index}`}
                  cx="40%"
                  cy="40%"
                >
                  <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                  <stop offset="40%" stopColor="rgba(255,255,255,0.2)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              ))}

              {/* Premium glow filter */}
              <filter id="premiumGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <g transform="translate(400, 400)">
              {/* Outer gold ring - animated */}
              <circle
                cx="0"
                cy="0"
                r="380"
                fill="none"
                stroke="url(#goldRing)"
                strokeWidth="20"
                opacity="0.95"
                filter="url(#premiumGlow)"
                strokeDasharray="40 15"
                style={{
                  animation: 'spinRing 25s linear infinite reverse',
                }}
              />

              {/* Secondary ring */}
              <circle
                cx="0"
                cy="0"
                r="370"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                opacity="0.6"
                filter="url(#premiumGlow)"
              />

              {/* Decorative dots */}
              {Array.from({ length: 32 }, (_, i) => {
                const dotAngle = (i * 360) / 32
                const dotRad = (dotAngle * Math.PI) / 180
                const dotX = Math.cos(dotRad) * 385
                const dotY = Math.sin(dotRad) * 385
                return (
                  <circle
                    key={`dot-${i}`}
                    cx={dotX}
                    cy={dotY}
                    r="5"
                    fill="#ffd700"
                    opacity="0.9"
                    filter="url(#premiumGlow)"
                  />
                )
              })}

              {/* Wheel background */}
              <circle
                cx="0"
                cy="0"
                r="360"
                fill="url(#wheelBgPremium)"
                stroke="#000"
                strokeWidth="10"
              />

              {/* Rotating segments */}
              <g
                style={{
                  transform: `rotate(${currentRotation}deg)`,
                  transformOrigin: 'center center',
                  transformBox: 'fill-box',
                  transition: isSpinning
                    ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                    : 'transform 0.3s ease-out',
                }}
              >
                {segments.map((segment, index) => {
                  const startAngle = index * anglePerSegment - 90
                  const endAngle = startAngle + anglePerSegment
                  const midAngle = startAngle + anglePerSegment / 2

                  const startRad = (startAngle * Math.PI) / 180
                  const endRad = (endAngle * Math.PI) / 180
                  const midRad = (midAngle * Math.PI) / 180

                  const x1 = Math.cos(startRad) * 355
                  const y1 = Math.sin(startRad) * 355
                  const x2 = Math.cos(endRad) * 355
                  const y2 = Math.sin(endRad) * 355

                  const largeArc = anglePerSegment > 180 ? 1 : 0

                  const textX = Math.cos(midRad) * 260
                  const textY = Math.sin(midRad) * 260

                  const iconX = Math.cos(midRad) * 300
                  const iconY = Math.sin(midRad) * 300

                  return (
                    <g key={segment.id}>
                      {/* Segment base */}
                      <path
                        d={`M 0 0 L ${x1} ${y1} A 355 355 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={segment.color}
                        stroke="#000"
                        strokeWidth="6"
                        style={{
                          filter: segment.is_prize
                            ? 'drop-shadow(0 0 20px rgba(255,215,0,0.7))'
                            : 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                        }}
                      />

                      {/* Premium glossy overlay */}
                      <path
                        d={`M 0 0 L ${x1} ${y1} A 355 355 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={`url(#premiumShine-${index})`}
                        pointerEvents="none"
                        opacity="0.7"
                      />

                      {/* Prize star with glow */}
                      {segment.is_prize && (
                        <>
                          <text
                            x={iconX}
                            y={iconY}
                            fill="#ffd700"
                            fontSize="55"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            filter="url(#premiumGlow)"
                            transform={`rotate(${-currentRotation} ${iconX} ${iconY})`}
                          >
                            ⭐
                          </text>
                          <text
                            x={iconX}
                            y={iconY}
                            fill="white"
                            fontSize="38"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={`rotate(${-currentRotation} ${iconX} ${iconY})`}
                          >
                            🎁
                          </text>
                        </>
                      )}

                      {/* Premium text with stroke */}
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="20"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontFamily="'Righteous', 'Work Sans', sans-serif"
                        transform={`rotate(${-currentRotation} ${textX} ${textY})`}
                        style={{
                          textShadow: '0 0 20px rgba(0,0,0,1), 0 5px 15px rgba(0,0,0,1), 0 0 8px rgba(255,255,255,0.6)',
                          paintOrder: 'stroke fill',
                          stroke: '#000',
                          strokeWidth: '5px',
                          strokeLinejoin: 'round',
                          letterSpacing: '1px',
                        }}
                      >
                        {segment.label}
                      </text>
                    </g>
                  )
                })}
              </g>

              {/* Premium center hub */}
              <circle cx="0" cy="0" r="70" fill="#000" opacity="0.9" />
              <circle
                cx="0"
                cy="0"
                r="60"
                fill="url(#centerGlow)"
                opacity="0.95"
                filter="url(#premiumGlow)"
              />
              <circle
                cx="0"
                cy="0"
                r="45"
                fill="#1a0a2e"
                stroke="#ffd700"
                strokeWidth="4"
                filter="url(#premiumGlow)"
              />
              <circle cx="0" cy="0" r="30" fill="#ff1493" filter="url(#premiumGlow)" />
              <circle cx="0" cy="0" r="18" fill="#ffd700" />
            </g>
          </svg>
        </div>

        {/* Premium pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          {/* Pointer arrow */}
          <div
            className="relative"
            style={{
              width: 0,
              height: 0,
              borderLeft: '35px solid transparent',
              borderRight: '35px solid transparent',
              borderTop: '70px solid #ffd700',
              filter: 'drop-shadow(0 0 20px rgba(255,215,0,1)) drop-shadow(0 0 40px rgba(255,215,0,0.6)) drop-shadow(0 8px 15px rgba(0,0,0,0.8))',
            }}
          />
          {/* Winner badge */}
          <div
            className="mt-2 px-8 py-3 rounded-b-2xl font-black text-xl tracking-widest"
            style={{
              background: 'linear-gradient(180deg, #ffd700 0%, #ff8c00 100%)',
              boxShadow: '0 0 40px rgba(255,215,0,0.9), 0 0 80px rgba(255,140,0,0.5), inset 0 0 20px rgba(255,255,255,0.5)',
              textShadow: '0 0 15px rgba(255,255,255,0.9), 0 3px 6px rgba(0,0,0,0.9), 0 0 30px rgba(255,215,0,0.8)',
              color: '#1a0a2e',
              border: '3px solid #fff',
            }}
          >
            ⭐ WINNER ⭐
          </div>
        </div>
      </div>

      {/* 3D Premium base */}
      <div className="relative w-full max-w-5xl -mt-4">
        <div
          className="w-full h-32 rounded-b-3xl relative"
          style={{
            background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0416 50%, #000 100%)',
            boxShadow: '0 15px 60px rgba(0,0,0,0.8), inset 0 -8px 30px rgba(255,215,0,0.2), inset 0 8px 30px rgba(255,20,147,0.2)',
            border: '4px solid rgba(255,215,0,0.4)',
            borderTop: '4px solid rgba(255,140,0,0.5)',
          }}
        >
          {/* Decorative lights on base */}
          <div className="flex items-center justify-center h-full gap-6">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="w-20 h-4 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #ffd700 0%, #ff8c00 50%, #ffd700 100%)',
                  boxShadow: '0 0 20px rgba(255,215,0,0.8), inset 0 0 10px rgba(255,255,255,0.5)',
                  opacity: 0.7,
                  animation: `ledPulse ${1 + i * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.8;
          }
        }

        @keyframes rotateRay {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes ledPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(0.95);
          }
        }

        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
