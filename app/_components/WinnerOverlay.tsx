'use client'

interface WinnerOverlayProps {
  segmentLabel: string
}

export function WinnerOverlay({ segmentLabel }: WinnerOverlayProps) {
  // Generate confetti elements
  const confettiCount = 30
  const confetti = Array.from({ length: confettiCount }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 4)],
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-6 animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: '-10%',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}

      {/* Winner card */}
      <div className="bg-white rounded-2xl p-12 shadow-2xl max-w-lg mx-4 text-center animate-bounce-in festive-border">
        <div className="text-8xl mb-6 animate-bounce">🎉</div>
        <h2 className="text-5xl font-black text-primary mb-4 uppercase">
          Félicitations !
        </h2>
        <div className="text-3xl font-bold text-gray-900 bg-yellow-100 py-4 px-6 rounded-xl mb-6 festive-shadow">
          {segmentLabel}
        </div>
        <p className="text-xl text-gray-600">Vous avez gagné un prix !</p>
      </div>
    </div>
  )
}
