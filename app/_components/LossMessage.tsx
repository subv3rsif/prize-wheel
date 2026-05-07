'use client'

interface LossMessageProps {
  message?: string
}

export function LossMessage({ message = "Merci d'avoir participé !" }: LossMessageProps) {
  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 animate-slide-bounce">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-60" />

        {/* Message card */}
        <div className="relative bg-gradient-to-r from-[#1a0f2e] to-[#0a0118] text-white px-10 py-5 rounded-full border-3 border-purple-400"
          style={{
            boxShadow: '0 0 30px rgba(181,55,242,0.6), inset 0 0 20px rgba(255,107,53,0.2)',
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>
              ✨
            </span>
            <p className="text-2xl font-bold tracking-wide"
              style={{
                textShadow: '0 0 20px rgba(181,55,242,0.8), 0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {message}
            </p>
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>
              ✨
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-3 left-1/4 w-6 h-6 rounded-full bg-yellow-400 animate-ping" />
        <div className="absolute -top-3 right-1/4 w-6 h-6 rounded-full bg-cyan-400 animate-ping" style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  )
}
