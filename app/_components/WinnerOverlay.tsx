'use client'

interface WinnerOverlayProps {
  segmentLabel: string
}

export function WinnerOverlay({ segmentLabel }: WinnerOverlayProps) {
  // Generate massive confetti explosion
  const confettiCount = 80
  const confetti = Array.from({ length: confettiCount }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 2.5 + Math.random() * 1.5,
    color: ['#ff006e', '#00f0ff', '#ff6b35', '#ffee32', '#b537f2'][Math.floor(Math.random() * 5)],
    size: 8 + Math.random() * 12,
    rotation: Math.random() * 360,
  }))

  // Sparkle elements
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    top: 10 + Math.random() * 80,
    left: 10 + Math.random() * 80,
    delay: Math.random() * 1,
    size: 20 + Math.random() * 30,
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      {/* Confetti explosion */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-enhanced"
          style={{
            left: `${piece.left}%`,
            top: '-5%',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            boxShadow: `0 0 ${piece.size}px ${piece.color}`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}

      {/* Sparkle effects around card */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-pulse"
          style={{
            top: `${sparkle.top}%`,
            left: `${sparkle.left}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,238,50,0.8) 0%, transparent 70%)',
              filter: 'blur(4px)',
            }}
          />
        </div>
      ))}

      {/* Winner card with neon carnival styling */}
      <div className="relative animate-bounce-elastic">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl blur-2xl opacity-50 scale-110" />

        {/* Main card */}
        <div className="relative bg-gradient-to-br from-[#1a0f2e] to-[#0a0118] rounded-3xl p-12 shadow-2xl max-w-2xl mx-4 text-center border-4 border-cyan-400"
          style={{
            boxShadow: '0 0 40px rgba(0,240,255,0.5), inset 0 0 60px rgba(255,107,53,0.2)',
          }}
        >
          {/* Animated emoji */}
          <div className="relative mb-8">
            <div className="text-9xl animate-bounce inline-block">🎉</div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400/30 rounded-full blur-3xl animate-pulse" />
          </div>

          {/* Title */}
          <h2 className="heading-circus text-8xl mb-6 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 bg-clip-text text-transparent"
            style={{
              textShadow: '0 0 40px rgba(255,238,50,0.5)',
            }}
          >
            FÉLICITATIONS !
          </h2>

          {/* Prize label */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-60" />
            <div className="relative text-5xl font-black text-white py-6 px-10 rounded-2xl border-4 border-yellow-400 bg-gradient-to-br from-orange-500 to-pink-600"
              style={{
                boxShadow: '0 0 30px rgba(255,238,50,0.6), inset 0 0 20px rgba(255,255,255,0.2)',
                textShadow: '0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)',
              }}
            >
              {segmentLabel}
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-3xl font-bold text-cyan-300 tracking-wide"
            style={{
              textShadow: '0 0 20px rgba(0,240,255,0.8)',
            }}
          >
            Vous avez gagné un prix !
          </p>

          {/* Decorative stars */}
          <div className="absolute -top-6 -left-6 text-6xl animate-spin" style={{ animationDuration: '3s' }}>
            ⭐
          </div>
          <div className="absolute -top-6 -right-6 text-6xl animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
            ⭐
          </div>
          <div className="absolute -bottom-6 -left-6 text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>
            🎊
          </div>
          <div className="absolute -bottom-6 -right-6 text-5xl animate-bounce" style={{ animationDelay: '0.4s' }}>
            🎊
          </div>
        </div>
      </div>
    </div>
  )
}
