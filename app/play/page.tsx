'use client'

import { useState, useEffect } from 'react'
import { drawPrize } from '@/app/actions/wheel'
import { createClient } from '@/lib/supabase/client'
import { Wheel } from '@/app/_components/Wheel'

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
      className="relative flex flex-col items-center justify-center min-h-screen carnival-bg overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Title banner */}
      <div className="absolute top-6 left-0 right-0 flex flex-col items-center z-10 pointer-events-none">
        <h1 className="heading-circus text-4xl md:text-5xl neon-text-orange mb-2">
          PRIZE WHEEL
        </h1>
        <p className="text-base md:text-lg text-white/60 font-semibold tracking-wide">
          {isSpinning ? '⚡ En rotation...' : 'Touchez le bouton pour jouer'}
        </p>
      </div>

      {/* Wheel Display */}
      <div className="relative z-10 scale-75 md:scale-90 lg:scale-100">
        <Wheel
          segments={segments}
          isSpinning={isSpinning}
          targetAngle={targetAngle}
          spinDuration={spinDuration}
        />
      </div>

      {/* SPIN button - positioned over wheel center */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="absolute z-30 disabled:cursor-not-allowed group touch-manipulation"
        style={{
          WebkitTapHighlightColor: 'transparent',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Outer glow ring */}
        {!isSpinning && (
          <div className="absolute -inset-6 rounded-full blur-2xl opacity-60 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 rounded-full animate-pulse" />
          </div>
        )}

        {/* Button surface */}
        <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full border-6 flex items-center justify-center transition-all duration-200 ${
          isSpinning
            ? 'border-cyan-400 bg-gradient-to-br from-[#1a0f2e] to-[#0a0118]'
            : 'border-yellow-300 bg-gradient-to-br from-orange-500 via-pink-600 to-purple-600 active:scale-90'
        }`}
          style={{
            boxShadow: isSpinning
              ? '0 0 40px rgba(0,240,255,0.9), 0 0 80px rgba(0,240,255,0.6), inset 0 0 25px rgba(0,240,255,0.3)'
              : '0 0 40px rgba(255,238,50,0.8), 0 0 70px rgba(255,107,53,0.6), inset 0 0 25px rgba(255,255,255,0.3), 0 8px 30px rgba(0,0,0,0.5)',
          }}
        >
          {isSpinning ? (
            <div className="flex flex-col items-center gap-2">
              <div className="text-4xl md:text-5xl animate-spin" style={{ animationDuration: '1.5s' }}>
                ⚡
              </div>
            </div>
          ) : (
            <div className="heading-circus text-3xl md:text-4xl text-white tracking-wider select-none"
              style={{
                textShadow: '0 0 25px rgba(255,238,50,0.9), 0 4px 8px rgba(0,0,0,0.8), 0 0 50px rgba(255,107,53,0.7)',
              }}
            >
              {buttonLabel}
            </div>
          )}
        </div>
      </button>

      {/* Instruction hint */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10 pointer-events-none px-4">
        <div className="bg-black/40 backdrop-blur-sm border-2 border-yellow-400/40 rounded-full px-6 py-2">
          <p className="text-sm md:text-base text-white/90 font-bold tracking-wide text-center">
            ✨ Touchez le bouton au centre • Glissez vers le haut ↑
          </p>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-8 left-8 w-20 h-20 border-l-4 border-t-4 border-cyan-400/30 rounded-tl-3xl pointer-events-none" />
      <div className="absolute top-8 right-8 w-20 h-20 border-r-4 border-t-4 border-magenta-400/30 rounded-tr-3xl pointer-events-none" />
      <div className="absolute bottom-24 left-8 w-20 h-20 border-l-4 border-b-4 border-orange-400/30 rounded-bl-3xl pointer-events-none" />
      <div className="absolute bottom-24 right-8 w-20 h-20 border-r-4 border-b-4 border-purple-400/30 rounded-br-3xl pointer-events-none" />
    </div>
  )
}
