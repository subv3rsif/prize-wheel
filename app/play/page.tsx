'use client'

import { useState, useEffect } from 'react'
import { drawPrize, forceUnlockWheel } from '@/app/actions/wheel'
import { createClient } from '@/lib/supabase/client'
import { PremiumHalfWheel } from '@/app/_components/PremiumHalfWheel'
import { PremiumResultOverlay } from '@/app/_components/PremiumResultOverlay'

interface Segment {
  id: string
  label: string
  color: string
  is_prize: boolean
  display_order: number
}

export default function PlayPage() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [targetAngle, setTargetAngle] = useState(0)
  const [spinDuration, setSpinDuration] = useState(6000)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [buttonLabel, setButtonLabel] = useState('LAUNCH')
  const [showResult, setShowResult] = useState(false)
  const [resultSegment, setResultSegment] = useState<{ label: string; isPrize: boolean } | null>(null)
  const [showWinnerFlash, setShowWinnerFlash] = useState(false)
  const supabase = createClient()

  // Fetch segments
  useEffect(() => {
    const fetchSegments = async () => {
      const { data } = await supabase
        .from('segments')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (data) {
        setSegments(data)
      }
    }

    fetchSegments()

    // Subscribe to segment changes
    const segmentsChannel = supabase
      .channel('segments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'segments' }, () => {
        fetchSegments()
      })
      .subscribe()

    return () => {
      segmentsChannel.unsubscribe()
    }
  }, [supabase])

  // Fetch button label
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('spin_button_label')
        .eq('id', 1)
        .single()

      if (data?.spin_button_label) {
        setButtonLabel(data.spin_button_label)
      }
    }

    fetchSettings()
  }, [supabase])

  // Subscribe to spin events to animate wheel and sync button state
  useEffect(() => {
    const channel = supabase.channel('wheel')

    channel
      .on('broadcast', { event: 'spin' }, (payload: any) => {
        const { targetAngle: angle, spinDuration: duration, segmentLabel, isPrize } = payload.payload

        setIsSpinning(true)
        setTargetAngle(angle)
        setSpinDuration(duration)
        setShowResult(false)

        setTimeout(async () => {
          setIsSpinning(false)
          console.log('🎯 Wheel stopped! Triggering flash animation...')

          // Dramatic flash effect when wheel stops
          setShowWinnerFlash(true)
          console.log('✨ Flash burst activated')
          setTimeout(() => {
            setShowWinnerFlash(false)
            console.log('💫 Flash burst ended')
          }, 800)

          // Show result after dramatic pause
          setTimeout(() => {
            setResultSegment({ label: segmentLabel, isPrize })
            setShowResult(true)

            // Auto-hide result after 5 seconds
            setTimeout(() => {
              setShowResult(false)
            }, 5000)
          }, 600)

          // Release the spin lock on server
          await forceUnlockWheel()
        }, duration)
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase])

  const handleSpin = async () => {
    if (isSpinning) return

    setIsSpinning(true)
    const result = await drawPrize()

    if (result.error) {
      console.error('Spin error:', result.error)
      if (result.code !== 'CONCURRENT_SPIN') {
        alert(`Erreur: ${result.error}`)
      }
      setIsSpinning(false)
    }
  }

  // Swipe-up gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartY) return

    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchStartY - touchEndY

    // Swipe up with minimum 80px delta
    if (deltaY >= 80) {
      handleSpin()
    }

    setTouchStartY(null)
  }

  return (
    <>
      <div
        className="relative flex flex-col min-h-screen overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0d0416 50%, #000 100%)',
        }}
      >
        {/* Logo placeholder at top */}
        <div className="relative h-24 flex items-center justify-center z-10 border-b-2 border-yellow-600/30">
          <div
            className="flex items-center justify-center w-48 h-16 rounded-2xl border-4 border-dashed border-yellow-600/50"
            style={{
              background: 'rgba(255,215,0,0.1)',
            }}
          >
            <span className="text-yellow-600/70 font-bold text-sm tracking-wider">
              VOTRE LOGO
            </span>
          </div>
        </div>

        {/* Premium Half Wheel */}
        <div className="relative flex-shrink-0 pt-6">
          <PremiumHalfWheel
            segments={segments}
            isSpinning={isSpinning}
            targetAngle={targetAngle}
            spinDuration={spinDuration}
          />

          {/* Winner flash burst effect */}
          {showWinnerFlash && (
            <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center animate-flash-burst">
              {/* Multiple expanding rings */}
              <div
                className="absolute w-32 h-32 rounded-full animate-expand-ring"
                style={{
                  background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0) 70%)',
                }}
              />
              <div
                className="absolute w-32 h-32 rounded-full animate-expand-ring"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,215,0,0) 70%)',
                  animationDelay: '0.1s',
                }}
              />
              <div
                className="absolute w-32 h-32 rounded-full animate-expand-ring"
                style={{
                  background: 'radial-gradient(circle, rgba(255,140,0,0.8) 0%, rgba(255,140,0,0) 70%)',
                  animationDelay: '0.2s',
                }}
              />

              {/* Sparkles burst */}
              {Array.from({ length: 12 }, (_, i) => {
                const angle = (i * 360) / 12
                return (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-yellow-300 animate-sparkle-shoot"
                    style={{
                      animationDelay: `${i * 0.03}s`,
                      transform: `rotate(${angle}deg)`,
                      boxShadow: '0 0 10px rgba(255,215,0,1)',
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Premium LAUNCH button */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-8 pb-16">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="relative disabled:cursor-not-allowed group touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {/* Rotating glow rings - multiple layers */}
            {!isSpinning && (
              <>
                <div className="absolute -inset-16 rounded-full blur-3xl opacity-60 pointer-events-none animate-spin" style={{ animationDuration: '8s' }}>
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: 'conic-gradient(from 0deg, #ffd700, #ff8c00, #ff6347, #ff1493, #ffd700)',
                    }}
                  />
                </div>
                <div className="absolute -inset-12 rounded-full blur-2xl opacity-80 pointer-events-none">
                  <div
                    className="w-full h-full rounded-full animate-pulse"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,215,0,0.9) 0%, rgba(255,140,0,0.6) 50%, transparent 70%)',
                      animationDuration: '2s',
                    }}
                  />
                </div>
              </>
            )}

            {/* Spinning state - rotating energy rings */}
            {isSpinning && (
              <>
                <div className="absolute -inset-20 rounded-full blur-3xl opacity-70 pointer-events-none">
                  <div
                    className="w-full h-full rounded-full animate-spin"
                    style={{
                      background: 'conic-gradient(from 0deg, #00ffff, #00f0ff, transparent, #00ffff)',
                      animationDuration: '1s',
                    }}
                  />
                </div>
                <div className="absolute -inset-16 rounded-full blur-2xl opacity-60 pointer-events-none">
                  <div
                    className="w-full h-full rounded-full animate-spin"
                    style={{
                      background: 'conic-gradient(from 180deg, transparent, #00ffff, transparent)',
                      animationDuration: '1.5s',
                    }}
                  />
                </div>
              </>
            )}

            {/* Premium button - enhanced 3D effect - EXTRA LARGE */}
            <div
              className={`relative w-80 h-80 md:w-96 md:h-96 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSpinning ? 'scale-95' : 'active:scale-90'
              }`}
              style={{
                background: isSpinning
                  ? 'linear-gradient(135deg, #1a0a2e 0%, #0d0416 100%)'
                  : 'linear-gradient(135deg, #ffd700 0%, #ff8c00 30%, #ff6347 70%, #ff1493 100%)',
                border: isSpinning ? '8px solid #00ffff' : '8px solid #fff',
                boxShadow: isSpinning
                  ? '0 0 60px rgba(0,255,255,1), 0 0 120px rgba(0,255,255,0.8), inset 0 0 60px rgba(0,255,255,0.4), 0 20px 60px rgba(0,0,0,0.9)'
                  : '0 0 80px rgba(255,215,0,1), 0 0 150px rgba(255,140,0,0.9), inset 0 0 60px rgba(255,255,255,0.6), 0 25px 70px rgba(0,0,0,0.8)',
              }}
            >
              {/* Inner ring decoration */}
              <div
                className="absolute inset-6 rounded-full pointer-events-none"
                style={{
                  border: isSpinning ? '3px solid rgba(0,255,255,0.3)' : '3px solid rgba(255,255,255,0.4)',
                  boxShadow: isSpinning
                    ? 'inset 0 0 30px rgba(0,255,255,0.3)'
                    : 'inset 0 0 30px rgba(255,215,0,0.3)',
                }}
              />
              {isSpinning ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {/* Multiple rotating lightning bolts */}
                    <div
                      className="text-8xl animate-spin absolute inset-0 flex items-center justify-center"
                      style={{
                        animationDuration: '1s',
                        filter: 'drop-shadow(0 0 30px rgba(0,255,255,1))',
                        opacity: 0.6,
                      }}
                    >
                      ⚡
                    </div>
                    <div
                      className="text-8xl animate-spin relative"
                      style={{
                        animationDuration: '1.2s',
                        filter: 'drop-shadow(0 0 40px rgba(0,255,255,1)) drop-shadow(0 0 60px rgba(0,255,255,0.8))',
                      }}
                    >
                      ⚡
                    </div>
                  </div>
                  <div
                    className="text-2xl font-black tracking-wider animate-pulse"
                    style={{
                      fontFamily: "'Righteous', cursive",
                      color: '#00ffff',
                      textShadow: '0 0 30px rgba(0,255,255,1), 0 0 50px rgba(0,255,255,0.8), 0 4px 8px rgba(0,0,0,0.9)',
                      animationDuration: '1.5s',
                    }}
                  >
                    SPINNING...
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Text shadow layers for 3D depth */}
                  <div
                    className="absolute inset-0 flex items-center justify-center blur-sm opacity-70"
                    style={{
                      fontFamily: "'Righteous', cursive",
                      fontSize: 'inherit',
                      color: '#ff8c00',
                    }}
                  >
                    {buttonLabel}
                  </div>
                  <div
                    className="relative text-6xl md:text-7xl font-black tracking-wider select-none"
                    style={{
                      fontFamily: "'Righteous', cursive",
                      background: 'linear-gradient(180deg, #fff 0%, #ffd700 50%, #ff8c00 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.9)) drop-shadow(0 0 60px rgba(255,215,0,0.8)) drop-shadow(0 6px 20px rgba(0,0,0,0.8))',
                    }}
                  >
                    {buttonLabel}
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* Instructions */}
          <div
            className="mt-12 px-10 py-4 rounded-2xl border-3"
            style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,140,0,0.1) 100%)',
              borderColor: 'rgba(255,215,0,0.4)',
              boxShadow: '0 0 30px rgba(255,215,0,0.3)',
            }}
          >
            <p
              className="text-xl md:text-2xl font-bold tracking-wide text-center"
              style={{
                color: '#ffd700',
                textShadow: '0 0 20px rgba(255,215,0,0.8), 0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              ✨ Touchez le bouton • Glissez vers le haut ↑
            </p>
          </div>
        </div>
      </div>

      {/* Premium Result Overlay */}
      {showResult && resultSegment && (
        <PremiumResultOverlay
          segmentLabel={resultSegment.label}
          isPrize={resultSegment.isPrize}
        />
      )}
    </>
  )
}
