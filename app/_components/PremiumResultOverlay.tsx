'use client'

import { useEffect, useState } from 'react'

interface PremiumResultOverlayProps {
  segmentLabel: string
  isPrize: boolean
  onClose?: () => void
}

export function PremiumResultOverlay({ segmentLabel, isPrize, onClose }: PremiumResultOverlayProps) {
  const [confetti, setConfetti] = useState<Array<{
    id: number
    x: number
    y: number
    rotation: number
    delay: number
    duration: number
    color: string
    size: number
  }>>([])

  useEffect(() => {
    if (isPrize) {
      // Generate massive 3D confetti
      const newConfetti = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: ['#ffd700', '#ff8c00', '#ff1493', '#8b00ff', '#00ff00'][Math.floor(Math.random() * 5)],
        size: 8 + Math.random() * 12,
      }))
      setConfetti(newConfetti)
    }
  }, [isPrize])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Massive confetti explosion for prizes */}
      {isPrize && confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            animation: `confettiFall ${piece.duration}s ease-in forwards`,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
            boxShadow: `0 0 ${piece.size * 2}px ${piece.color}`,
          }}
        />
      ))}

      {/* Radial light burst */}
      {isPrize && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,215,0,0.3) 0%, transparent 60%)',
            animation: 'radiateLight 2s ease-out',
          }}
        />
      )}

      {/* Rotating sparkle rings */}
      {isPrize && Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            animation: `rotateSparkles ${4 + i}s linear infinite`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
          }}
        >
          {Array.from({ length: 12 }, (_, j) => {
            const angle = (j * 360) / 12
            const distance = 200 + i * 100
            const x = Math.cos((angle * Math.PI) / 180) * distance
            const y = Math.sin((angle * Math.PI) / 180) * distance
            return (
              <div
                key={j}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  background: 'radial-gradient(circle, #ffd700 0%, transparent 70%)',
                  boxShadow: '0 0 20px rgba(255,215,0,1)',
                  animation: 'twinkle 1s ease-in-out infinite',
                  animationDelay: `${j * 0.1}s`,
                }}
              />
            )
          })}
        </div>
      ))}

      {/* Main result card */}
      <div
        className="relative max-w-4xl mx-8 text-center"
        style={{
          animation: 'zoomBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        }}
      >
        {/* Glow backdrop */}
        <div
          className="absolute inset-0 rounded-3xl blur-3xl"
          style={{
            background: isPrize
              ? 'radial-gradient(ellipse, rgba(255,215,0,0.8) 0%, rgba(255,20,147,0.4) 50%, transparent 100%)'
              : 'radial-gradient(ellipse, rgba(138,43,226,0.6) 0%, transparent 70%)',
            transform: 'scale(1.2)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />

        {/* Result card content */}
        <div
          className="relative rounded-3xl p-12 border-8"
          style={{
            background: isPrize
              ? 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)'
              : 'linear-gradient(135deg, #0d0416 0%, #1a0a2e 50%, #0d0416 100%)',
            borderColor: isPrize ? '#ffd700' : '#8b00ff',
            boxShadow: isPrize
              ? '0 0 60px rgba(255,215,0,0.8), 0 0 120px rgba(255,20,147,0.4), inset 0 0 60px rgba(255,215,0,0.2)'
              : '0 0 60px rgba(138,43,226,0.6), inset 0 0 60px rgba(138,43,226,0.2)',
          }}
        >
          {/* Top emoji with mega glow */}
          <div
            className="text-9xl mb-8"
            style={{
              animation: 'floatEmoji 3s ease-in-out infinite',
              filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.9))',
            }}
          >
            {isPrize ? '🎉' : '✨'}
          </div>

          {/* PREMIUM text effect - "BIG WIN" style */}
          {isPrize && (
            <div className="mb-8 relative">
              {/* Text shadow layers */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  filter: 'blur(20px)',
                  opacity: 0.8,
                }}
              >
                <h1
                  className="font-black text-8xl"
                  style={{
                    fontFamily: "'Righteous', cursive",
                    background: 'linear-gradient(180deg, #ffd700 0%, #ff8c00 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  BIG WIN
                </h1>
              </div>

              {/* Main text with marquee LED effect */}
              <h1
                className="relative font-black text-8xl"
                style={{
                  fontFamily: "'Righteous', cursive",
                  background: 'linear-gradient(180deg, #fff 0%, #ffd700 50%, #ff8c00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 40px rgba(255,215,0,1), 0 0 80px rgba(255,140,0,0.8), 0 10px 30px rgba(0,0,0,0.9)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))',
                  animation: 'textPulse 2s ease-in-out infinite',
                }}
              >
                BIG WIN
              </h1>

              {/* LED dots around text */}
              <div className="absolute -inset-8 pointer-events-none">
                {Array.from({ length: 8 }, (_, i) => {
                  const positions = [
                    { top: '0', left: '10%' },
                    { top: '0', left: '90%' },
                    { top: '50%', left: '0', transform: 'translateY(-50%)' },
                    { top: '50%', right: '0', transform: 'translateY(-50%)' },
                    { bottom: '0', left: '10%' },
                    { bottom: '0', left: '90%' },
                    { top: '20%', left: '50%', transform: 'translateX(-50%)' },
                    { bottom: '20%', left: '50%', transform: 'translateX(-50%)' },
                  ][i]
                  return (
                    <div
                      key={i}
                      className="absolute w-4 h-4 rounded-full"
                      style={{
                        ...positions,
                        background: 'radial-gradient(circle, #ffd700 0%, transparent 70%)',
                        boxShadow: '0 0 20px rgba(255,215,0,1)',
                        animation: 'ledFlicker 0.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Prize label with premium styling */}
          <div className="relative mb-8">
            <div
              className="absolute inset-0 blur-2xl opacity-70"
              style={{
                background: isPrize
                  ? 'linear-gradient(90deg, #ffd700 0%, #ff8c00 50%, #ffd700 100%)'
                  : 'linear-gradient(90deg, #8b00ff 0%, #ff1493 50%, #8b00ff 100%)',
              }}
            />
            <div
              className="relative text-7xl font-black py-8 px-12 rounded-3xl"
              style={{
                fontFamily: "'Righteous', 'Work Sans', sans-serif",
                background: isPrize
                  ? 'linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #ff6347 100%)'
                  : 'linear-gradient(135deg, #8b00ff 0%, #ff1493 100%)',
                color: '#fff',
                textShadow: '0 5px 15px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.5)',
                boxShadow: isPrize
                  ? '0 0 60px rgba(255,215,0,0.9), inset 0 0 40px rgba(255,255,255,0.3), 0 15px 40px rgba(0,0,0,0.8)'
                  : '0 0 60px rgba(138,43,226,0.7), inset 0 0 40px rgba(255,255,255,0.2)',
                border: '6px solid rgba(255,255,255,0.5)',
                letterSpacing: '0.05em',
                animation: 'shimmer 3s ease-in-out infinite',
              }}
            >
              {segmentLabel}
            </div>
          </div>

          {/* Subtitle */}
          <p
            className="text-4xl font-bold tracking-wide"
            style={{
              color: isPrize ? '#ffd700' : '#ff1493',
              textShadow: isPrize
                ? '0 0 30px rgba(255,215,0,1), 0 4px 10px rgba(0,0,0,0.9)'
                : '0 0 30px rgba(255,20,147,1), 0 4px 10px rgba(0,0,0,0.9)',
              fontFamily: "'Work Sans', sans-serif",
            }}
          >
            {isPrize ? '🎁 FÉLICITATIONS ! 🎁' : 'Merci de participer !'}
          </p>

          {/* Decorative stars */}
          {isPrize && (
            <>
              <div
                className="absolute -top-10 -left-10 text-7xl"
                style={{
                  animation: 'rotateStar 4s linear infinite',
                  filter: 'drop-shadow(0 0 20px rgba(255,215,0,1))',
                }}
              >
                ⭐
              </div>
              <div
                className="absolute -top-10 -right-10 text-7xl"
                style={{
                  animation: 'rotateStar 4s linear infinite reverse',
                  filter: 'drop-shadow(0 0 20px rgba(255,215,0,1))',
                }}
              >
                ⭐
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(150vh) rotate(1080deg);
            opacity: 0.3;
          }
        }

        @keyframes radiateLight {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: scale(2);
          }
        }

        @keyframes zoomBounce {
          0% {
            transform: scale(0) rotate(-15deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.15) rotate(5deg);
          }
          80% {
            transform: scale(0.95) rotate(-3deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes floatEmoji {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        @keyframes textPulse {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(255,255,255,0.8)) drop-shadow(0 0 40px rgba(255,215,0,0.6));
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(255,255,255,1)) drop-shadow(0 0 80px rgba(255,215,0,1));
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes ledFlicker {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }

        @keyframes rotateSparkles {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes rotateStar {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
