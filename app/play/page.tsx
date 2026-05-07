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
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="relative w-80 h-80 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-7xl font-black shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all duration-200 festive-shadow"
      >
        {isSpinning ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin text-6xl">⏳</div>
            <div className="text-2xl font-semibold">En cours...</div>
          </div>
        ) : (
          buttonLabel
        )}
      </button>
    </div>
  )
}
