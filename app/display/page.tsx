'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PremiumHalfWheel } from '@/app/_components/PremiumHalfWheel'
import { PremiumResultOverlay } from '@/app/_components/PremiumResultOverlay'
import { SoundManagerProvider, useSoundManager } from '@/lib/sounds/SoundManager'

interface Segment {
  id: string
  label: string
  color: string
  is_prize: boolean
  display_order: number
}

function DisplayContent() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [targetAngle, setTargetAngle] = useState(0)
  const [spinDuration, setSpinDuration] = useState(6000)
  const [showResult, setShowResult] = useState(false)
  const [resultSegment, setResultSegment] = useState<{ label: string; isPrize: boolean } | null>(null)

  const { playTick, playWin, playLoss, stopTick } = useSoundManager()
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

  // Subscribe to spin events
  useEffect(() => {
    const channel = supabase.channel('wheel')

    channel
      .on('broadcast', { event: 'spin' }, (payload: any) => {
        const { targetAngle: angle, spinDuration: duration, segmentLabel, isPrize } = payload.payload

        setIsSpinning(true)
        setTargetAngle(angle)
        setSpinDuration(duration)
        setShowResult(false)

        // Play tick sound
        playTick()

        // At end of animation
        setTimeout(() => {
          setIsSpinning(false)
          stopTick()
          setResultSegment({ label: segmentLabel, isPrize })
          setShowResult(true)

          if (isPrize) {
            playWin()
          } else {
            playLoss()
          }

          // Auto-hide result after 5 seconds
          setTimeout(() => {
            setShowResult(false)
          }, 5000)
        }, duration)
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, playTick, playWin, playLoss, stopTick])

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen carnival-bg">
        <div className="text-center">
          <div className="text-9xl mb-8 animate-bounce-elastic">🎡</div>
          <h1 className="heading-circus text-7xl neon-text-cyan mb-6">
            En attente...
          </h1>
          <p className="text-3xl text-white/80 font-semibold animate-pulse">
            Chargement de la roue
          </p>
          <div className="mt-8 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-cyan-400"
                style={{
                  animation: 'pulse 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                  boxShadow: '0 0 20px var(--neon-cyan)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="relative flex flex-col min-h-screen overflow-hidden"
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
        </div>

        {/* Content area - waiting or minimal result */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-8 pb-16">
          {!showResult && (
            <div className="text-center">
              <div className="text-8xl mb-6 animate-pulse">🎡</div>
              <h2
                className="text-5xl font-black tracking-wider mb-4"
                style={{
                  fontFamily: "'Righteous', cursive",
                  color: '#00ffff',
                  textShadow: '0 0 30px rgba(0,255,255,0.9), 0 4px 10px rgba(0,0,0,0.8)',
                }}
              >
                EN ATTENTE
              </h2>
              <p className="text-2xl text-white/70 font-semibold">
                Prêt à tourner la roue...
              </p>
            </div>
          )}
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

export default function DisplayPage() {
  return (
    <SoundManagerProvider>
      <DisplayContent />
    </SoundManagerProvider>
  )
}
