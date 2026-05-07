'use client'

interface LossMessageProps {
  message?: string
}

export function LossMessage({ message = "Merci d'avoir participé !" }: LossMessageProps) {
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-slide-in-top">
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-8 py-4 rounded-full shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">😊</span>
          <p className="text-lg font-semibold">{message}</p>
          <span className="text-2xl">😊</span>
        </div>
      </div>
    </div>
  )
}
