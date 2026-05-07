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
      <div className="absolute top-12 left-0 right-0 flex flex-col items-center z-10 pointer-events-none">
        <h1 className="heading-circus text-5xl neon-text-magenta mb-3">
          CONTRÔLEUR
        </h1>
        <p className="text-xl text-white/70 font-semibold tracking-wide">
          {isSpinning ? '⚡ Rotation en cours...' : 'Appuyez ou glissez ↑'}
        </p>
      </div>

      {/* Main SPIN button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="relative z-30 disabled:cursor-not-allowed group touch-manipulation"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Outer glow ring */}
        {!isSpinning && (
          <div className="absolute -inset-8 rounded-full blur-3xl opacity-50 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 rounded-full animate-pulse" />
          </div>
        )}

        {/* Button surface */}
        <div className={`relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border-8 flex items-center justify-center transition-all duration-200 ${
          isSpinning
            ? 'border-cyan-400 bg-gradient-to-br from-[#1a0f2e] to-[#0a0118]'
            : 'border-yellow-300 bg-gradient-to-br from-orange-500 via-pink-600 to-purple-600 active:scale-95'
        }`}
          style={{
            boxShadow: isSpinning
              ? '0 0 50px rgba(0,240,255,0.8), 0 0 100px rgba(0,240,255,0.5), inset 0 0 30px rgba(0,240,255,0.2)'
              : '0 0 50px rgba(255,238,50,0.7), 0 0 80px rgba(255,107,53,0.5), inset 0 0 30px rgba(255,255,255,0.2), 0 10px 40px rgba(0,0,0,0.4)',
          }}
        >
          {isSpinning ? (
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div className="text-7xl animate-spin" style={{ animationDuration: '1.5s' }}>
                  ⚡
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-cyan-400/30 blur-xl animate-pulse" />
                </div>
              </div>
              <div className="heading-circus text-3xl text-cyan-300 animate-pulse"
                style={{
                  textShadow: '0 0 20px rgba(0,240,255,0.8)',
                }}
              >
                EN COURS
              </div>
            </div>
          ) : (
            <div className="heading-circus text-7xl sm:text-8xl text-white tracking-widest select-none"
              style={{
                textShadow: '0 0 30px rgba(255,238,50,0.9), 0 5px 10px rgba(0,0,0,0.7), 0 0 60px rgba(255,107,53,0.6)',
              }}
            >
              {buttonLabel}
            </div>
          )}
        </div>
      </button>

      {/* Instruction hint */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center z-10 pointer-events-none px-4">
        <div className="bg-black/30 backdrop-blur-sm border-2 border-white/20 rounded-full px-6 py-3">
          <p className="text-lg text-white/90 font-semibold tracking-wide text-center">
            💡 Glissez vers le haut pour tourner
          </p>
        </div>
      </div>
    </div>
  )
}
