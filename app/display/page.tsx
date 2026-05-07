'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HalfWheel } from '@/app/_components/HalfWheel'
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
    <div className="relative min-h-screen w-screen carnival-bg flex flex-col overflow-hidden">
      {/* Decorative top banner */}
      <div className="relative h-20 flex items-center justify-center z-10 border-b-2 border-white/10">
        <div className="relative">
          <h1 className="heading-circus text-4xl md:text-5xl neon-text-orange tracking-widest px-8">
            PRIZE WHEEL
          </h1>
          <div className="absolute -top-2 -right-2 w-16 h-16 rounded-full bg-yellow-400 opacity-20 blur-2xl animate-pulse" />
          <div className="absolute -bottom-2 -left-2 w-16 h-16 rounded-full bg-cyan-400 opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>

      {/* Half wheel at top */}
      <div className="relative flex-shrink-0 pt-6">
        <HalfWheel
          segments={segments}
          isSpinning={isSpinning}
          targetAngle={targetAngle}
          spinDuration={spinDuration}
        />
      </div>

      {/* Content area below wheel */}
      <div className="relative flex-1 flex items-center justify-center px-8 pb-8">
        <div className="w-full max-w-4xl">
          {/* Result display area */}
          {winningSegment && showOverlay ? (
            <div className="text-center">
              <div className="mb-8">
                <div className="inline-block px-12 py-6 rounded-3xl border-4 border-yellow-400 bg-gradient-to-br from-orange-500 to-pink-600"
                  style={{
                    boxShadow: '0 0 50px rgba(255,238,50,0.7), inset 0 0 30px rgba(255,255,255,0.3)',
                  }}
                >
                  <div className="text-7xl mb-4">{showOverlay === 'winner' ? '🎉' : '✨'}</div>
                  <h2 className="heading-circus text-6xl text-white mb-4"
                    style={{
                      textShadow: '0 0 30px rgba(255,238,50,0.9), 0 4px 10px rgba(0,0,0,0.8)',
                    }}
                  >
                    {winningSegment}
                  </h2>
                  <p className="text-2xl text-white/90 font-bold">
                    {showOverlay === 'winner' ? '🎁 FÉLICITATIONS !' : 'Merci de participer !'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-8xl mb-6 animate-pulse">🎡</div>
              <h2 className="heading-circus text-5xl neon-text-cyan mb-4">
                EN ATTENTE
              </h2>
              <p className="text-2xl text-white/70 font-semibold">
                Prêt à tourner la roue...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-24 left-8 w-24 h-24 border-l-4 border-t-4 border-cyan-400/30 rounded-tl-3xl pointer-events-none" />
      <div className="absolute top-24 right-8 w-24 h-24 border-r-4 border-t-4 border-magenta-400/30 rounded-tr-3xl pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-24 h-24 border-l-4 border-b-4 border-orange-400/30 rounded-bl-3xl pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-r-4 border-b-4 border-purple-400/30 rounded-br-3xl pointer-events-none" />

      {/* Full screen overlays */}
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
