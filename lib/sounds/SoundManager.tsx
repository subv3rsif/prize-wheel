'use client'

import { createContext, useContext, useRef, useEffect, useState, type ReactNode } from 'react'

interface SoundManagerContextType {
  playTick: () => void
  stopTick: () => void
  playWin: () => void
  playLoss: () => void
  setVolume: (volume: number) => void
}

const SoundManagerContext = createContext<SoundManagerContextType | null>(null)

export function SoundManagerProvider({ children }: { children: ReactNode }) {
  const tickAudioRef = useRef<HTMLAudioElement | null>(null)
  const winAudioRef = useRef<HTMLAudioElement | null>(null)
  const lossAudioRef = useRef<HTMLAudioElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Lazy load audio files
  useEffect(() => {
    if (typeof window === 'undefined') return

    tickAudioRef.current = new Audio('/sounds/tick.mp3')
    winAudioRef.current = new Audio('/sounds/win.mp3')
    lossAudioRef.current = new Audio('/sounds/loss.mp3')

    tickAudioRef.current.loop = true
    tickAudioRef.current.volume = 0.3

    // Preload
    Promise.all([
      tickAudioRef.current.load(),
      winAudioRef.current.load(),
      lossAudioRef.current.load(),
    ]).then(() => setIsLoaded(true))
      .catch(() => {
        console.warn('Audio files not found - app will run without sound')
        setIsLoaded(true)
      })

    return () => {
      tickAudioRef.current?.pause()
      winAudioRef.current?.pause()
      lossAudioRef.current?.pause()
    }
  }, [])

  const playTick = () => {
    if (!isLoaded || !tickAudioRef.current) return
    tickAudioRef.current.currentTime = 0
    tickAudioRef.current.play().catch(err => console.warn('Tick play failed:', err))
  }

  const stopTick = () => {
    if (!tickAudioRef.current) return
    tickAudioRef.current.pause()
    tickAudioRef.current.currentTime = 0
  }

  const playWin = () => {
    if (!isLoaded || !winAudioRef.current) return
    winAudioRef.current.currentTime = 0
    winAudioRef.current.play().catch(err => console.warn('Win play failed:', err))
  }

  const playLoss = () => {
    if (!isLoaded || !lossAudioRef.current) return
    lossAudioRef.current.currentTime = 0
    lossAudioRef.current.play().catch(err => console.warn('Loss play failed:', err))
  }

  const setVolume = (volume: number) => {
    const vol = Math.max(0, Math.min(1, volume))
    if (tickAudioRef.current) tickAudioRef.current.volume = vol * 0.3
    if (winAudioRef.current) winAudioRef.current.volume = vol
    if (lossAudioRef.current) lossAudioRef.current.volume = vol * 0.7
  }

  return (
    <SoundManagerContext.Provider
      value={{ playTick, stopTick, playWin, playLoss, setVolume }}
    >
      {children}
    </SoundManagerContext.Provider>
  )
}

export function useSoundManager() {
  const context = useContext(SoundManagerContext)
  if (!context) {
    throw new Error('useSoundManager must be used within SoundManagerProvider')
  }
  return context
}
