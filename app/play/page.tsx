'use client'

import { useState, useEffect } from 'react'
import { drawPrize } from '@/app/actions/wheel'
import { createClient } from '@/lib/supabase/client'

export default function PlayPage() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [buttonLabel, setButtonLabel] = useState('SPIN')
  const supabase = createClient()

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

  // Subscribe to spin events to sync button state
  useEffect(() => {
    const channel = supabase.channel('wheel')

    channel
      .on('broadcast', { event: 'spin' }, (payload: any) => {
        const { spinDuration } = payload.payload
        setIsSpinning(true)

        setTimeout(() => {
          setIsSpinning(false)
        }, spinDuration + 1000)
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
    <div
      className="relative flex flex-col items-center justify-center min-h-screen carnival-bg overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Title banner */}
      <div className="absolute top-12 left-0 right-0 flex flex-col items-center z-10">
        <h1 className="heading-circus text-6xl neon-text-magenta mb-4">
          CONTRÔLEUR
        </h1>
        <p className="text-2xl text-white/70 font-semibold tracking-wide">
          {isSpinning ? 'Rotation en cours...' : 'Appuyez ou glissez vers le haut'}
        </p>
      </div>

      {/* Decorative animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 opacity-20"
            style={{
              width: `${300 + i * 120}px`,
              height: `${300 + i * 120}px`,
              borderColor: ['#ff006e', '#00f0ff', '#ff6b35'][i - 1],
              animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Main SPIN button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="relative z-20 disabled:cursor-not-allowed group"
      >
        {/* Outer glow rings */}
        <div className="absolute inset-0 rounded-full blur-3xl opacity-60 group-active:opacity-80 transition-opacity">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full animate-pulse" />
        </div>
        <div className="absolute -inset-4 rounded-full blur-2xl opacity-40">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full"
            style={{ animation: 'pulse 2s ease-in-out infinite', animationDelay: '0.5s' }}
          />
        </div>

        {/* Button surface */}
        <div className={`relative w-96 h-96 rounded-full border-8 flex items-center justify-center transition-all duration-300 ${
          isSpinning
            ? 'border-cyan-400 bg-gradient-to-br from-[#1a0f2e] to-[#0a0118] animate-pulse-glow'
            : 'border-yellow-400 bg-gradient-to-br from-orange-500 via-pink-600 to-purple-600 group-hover:scale-105 group-active:scale-95'
        }`}
          style={{
            boxShadow: isSpinning
              ? '0 0 60px rgba(0,240,255,0.8), inset 0 0 40px rgba(0,240,255,0.2)'
              : '0 0 60px rgba(255,238,50,0.6), 0 0 100px rgba(255,107,53,0.4), inset 0 0 40px rgba(255,255,255,0.2)',
          }}
        >
          {isSpinning ? (
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="text-8xl animate-spin" style={{ animationDuration: '2s' }}>
                  ⚡
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-cyan-400/30 blur-xl animate-pulse" />
                </div>
              </div>
              <div className="heading-circus text-4xl neon-text-cyan">
                EN COURS...
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="heading-circus text-8xl text-white tracking-widest"
                style={{
                  textShadow: '0 0 30px rgba(255,238,50,0.8), 0 4px 8px rgba(0,0,0,0.6), 0 0 60px rgba(255,107,53,0.5)',
                }}
              >
                {buttonLabel}
              </div>
              {/* Shimmer effect */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="w-full h-full animate-shimmer" />
              </div>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        {!isSpinning && (
          <>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl animate-bounce">
              ⬇️
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-4xl opacity-60 animate-pulse">
              👆
            </div>
          </>
        )}
      </button>

      {/* Instruction hint */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center z-10">
        <div className="bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-full px-8 py-4">
          <p className="text-xl text-white font-semibold tracking-wide text-center">
            💡 Glissez vers le haut pour tourner
          </p>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-24 h-24 border-l-4 border-t-4 border-cyan-400/40 rounded-tl-3xl" />
      <div className="absolute top-8 right-8 w-24 h-24 border-r-4 border-t-4 border-magenta-400/40 rounded-tr-3xl" />
      <div className="absolute bottom-8 left-8 w-24 h-24 border-l-4 border-b-4 border-orange-400/40 rounded-bl-3xl" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-r-4 border-b-4 border-purple-400/40 rounded-br-3xl" />
    </div>
  )
}
