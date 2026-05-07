'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wheel } from '@/app/_components/Wheel'
import { WinnerOverlay } from '@/app/_components/WinnerOverlay'
import { LossMessage } from '@/app/_components/LossMessage'
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
  const [showOverlay, setShowOverlay] = useState<'winner' | 'loss' | null>(null)
  const [winningSegment, setWinningSegment] = useState<string>('')

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
        const { targetAngle, isPrize, segmentLabel, spinDuration } = payload.payload

        // Start animation
        setIsSpinning(true)
        setTargetAngle(targetAngle)
        setSpinDuration(spinDuration)
        setWinningSegment(segmentLabel)

        // Play tick sound
        playTick()

        // At end of animation
        setTimeout(() => {
          setIsSpinning(false)
          stopTick()

          if (isPrize) {
            playWin()
            setShowOverlay('winner')
            setTimeout(() => setShowOverlay(null), 5000)
          } else {
            playLoss()
            setShowOverlay('loss')
            setTimeout(() => setShowOverlay(null), 3000)
          }
        }, spinDuration)
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
    <div className="relative min-h-screen w-screen carnival-bg flex flex-col items-center justify-center overflow-hidden">
      {/* Decorative top banner */}
      <div className="absolute top-0 left-0 right-0 h-24 flex items-center justify-center z-10">
        <div className="relative">
          <h1 className="heading-circus text-5xl neon-text-orange tracking-widest px-8">
            PRIZE WHEEL
          </h1>
          <div className="absolute -top-2 -right-2 w-20 h-20 rounded-full bg-yellow-400 opacity-20 blur-2xl animate-pulse" />
          <div className="absolute -bottom-2 -left-2 w-20 h-20 rounded-full bg-cyan-400 opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>

      {/* Main wheel */}
      <div className="relative z-10">
        <Wheel
          segments={segments}
          isSpinning={isSpinning}
          targetAngle={targetAngle}
          spinDuration={spinDuration}
        />
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-8 left-8 w-32 h-32 border-l-4 border-t-4 border-cyan-400/30 rounded-tl-3xl" />
      <div className="absolute top-8 right-8 w-32 h-32 border-r-4 border-t-4 border-magenta-400/30 rounded-tr-3xl" />
      <div className="absolute bottom-8 left-8 w-32 h-32 border-l-4 border-b-4 border-orange-400/30 rounded-bl-3xl" />
      <div className="absolute bottom-8 right-8 w-32 h-32 border-r-4 border-b-4 border-purple-400/30 rounded-br-3xl" />

      {/* Overlays */}
      {showOverlay === 'winner' && (
        <WinnerOverlay segmentLabel={winningSegment} />
      )}

      {showOverlay === 'loss' && (
        <LossMessage />
      )}
    </div>
  )
}

export default function DisplayPage() {
  return (
    <SoundManagerProvider>
      <DisplayContent />
    </SoundManagerProvider>
  )
}
