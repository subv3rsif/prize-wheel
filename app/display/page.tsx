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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="text-center text-white">
          <div className="text-8xl mb-6">🎡</div>
          <h1 className="text-5xl font-bold mb-4">En attente...</h1>
          <p className="text-2xl opacity-90">Chargement de la roue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center overflow-hidden">
      <Wheel
        segments={segments}
        isSpinning={isSpinning}
        targetAngle={targetAngle}
        spinDuration={spinDuration}
      />

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
