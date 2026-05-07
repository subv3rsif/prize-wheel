'use client'

import { useState, useEffect } from 'react'
import { drawPrize } from '@/app/actions/wheel'
import { createClient } from '@/lib/supabase/client'
import { HalfWheel } from '@/app/_components/HalfWheel'

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
  const [buttonLabel, setButtonLabel] = useState('SPIN')
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
        const { targetAngle: angle, spinDuration: duration } = payload.payload

        setIsSpinning(true)
        setTargetAngle(angle)
        setSpinDuration(duration)

        setTimeout(() => {
          setIsSpinning(false)
        }, duration + 1000)
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
      className="relative flex flex-col min-h-screen carnival-bg overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Title banner */}
      <div className="relative h-16 flex items-center justify-center z-10 border-b border-white/10">
        <h1 className="heading-circus text-3xl md:text-4xl neon-text-orange">
          PRIZE WHEEL
        </h1>
        <p className="absolute right-6 text-sm text-white/60 font-semibold">
          {isSpinning ? '⚡ En rotation...' : 'Mode Tactile'}
        </p>
      </div>

      {/* Half Wheel Display */}
      <div className="relative flex-shrink-0 pt-4">
        <HalfWheel
          segments={segments}
          isSpinning={isSpinning}
          targetAngle={targetAngle}
          spinDuration={spinDuration}
        />
      </div>

      {/* Control area with SPIN button */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-8 pb-12">
        {/* SPIN button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="relative disabled:cursor-not-allowed group touch-manipulation mb-8"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Outer glow ring */}
          {!isSpinning && (
            <div className="absolute -inset-8 rounded-full blur-3xl opacity-60 pointer-events-none">
              <div className="w-full h-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 rounded-full animate-pulse" />
            </div>
          )}

          {/* Button surface */}
          <div className={`relative w-48 h-48 md:w-56 md:h-56 rounded-full border-8 flex items-center justify-center transition-all duration-200 ${
            isSpinning
              ? 'border-cyan-400 bg-gradient-to-br from-[#1a0f2e] to-[#0a0118]'
              : 'border-yellow-300 bg-gradient-to-br from-orange-500 via-pink-600 to-purple-600 active:scale-95'
          }`}
            style={{
              boxShadow: isSpinning
                ? '0 0 50px rgba(0,240,255,0.9), 0 0 100px rgba(0,240,255,0.6), inset 0 0 30px rgba(0,240,255,0.3)'
                : '0 0 50px rgba(255,238,50,0.8), 0 0 90px rgba(255,107,53,0.6), inset 0 0 30px rgba(255,255,255,0.3), 0 10px 40px rgba(0,0,0,0.5)',
            }}
          >
            {isSpinning ? (
              <div className="flex flex-col items-center gap-3">
                <div className="text-6xl md:text-7xl animate-spin" style={{ animationDuration: '1.5s' }}>
                  ⚡
                </div>
                <div className="heading-circus text-2xl text-cyan-300"
                  style={{ textShadow: '0 0 20px rgba(0,240,255,0.8)' }}
                >
                  EN COURS
                </div>
              </div>
            ) : (
              <div className="heading-circus text-5xl md:text-6xl text-white tracking-wider select-none"
                style={{
                  textShadow: '0 0 30px rgba(255,238,50,0.9), 0 5px 10px rgba(0,0,0,0.8), 0 0 60px rgba(255,107,53,0.7)',
                }}
              >
                {buttonLabel}
              </div>
            )}
          </div>
        </button>

        {/* Instructions */}
        <div className="bg-black/30 backdrop-blur-sm border-2 border-yellow-400/30 rounded-2xl px-8 py-4 max-w-lg">
          <p className="text-lg md:text-xl text-white/90 font-bold tracking-wide text-center">
            ✨ Touchez le bouton • Glissez vers le haut ↑
          </p>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-20 left-8 w-20 h-20 border-l-4 border-t-4 border-cyan-400/30 rounded-tl-3xl pointer-events-none" />
      <div className="absolute top-20 right-8 w-20 h-20 border-r-4 border-t-4 border-magenta-400/30 rounded-tr-3xl pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-20 h-20 border-l-4 border-b-4 border-orange-400/30 rounded-bl-3xl pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-r-4 border-b-4 border-purple-400/30 rounded-br-3xl pointer-events-none" />
    </div>
  )
}
