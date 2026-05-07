'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const tabs = [
    { name: 'Branding', href: '/admin', icon: '🎨' },
    { name: 'Segments', href: '/admin/segments', icon: '🎯' },
    { name: 'Paramètres', href: '/admin/settings', icon: '⚙️' },
    { name: 'Debug', href: '/admin/debug', icon: '🔧' },
  ]

  return (
    <div className="min-h-screen carnival-bg">
      {/* Decorative glow accents */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <header className="relative backdrop-blur-md bg-black/30 border-b-2 border-cyan-400/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header title */}
          <div className="flex items-center justify-between h-20 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🎡</div>
              <div>
                <h1 className="heading-circus text-3xl neon-text-orange">
                  ADMIN PANEL
                </h1>
                <p className="text-sm text-white/60 font-semibold">Prize Wheel Configuration</p>
              </div>
            </div>

            {/* Quick links */}
            <div className="flex gap-3">
              <Link
                href="/display"
                className="px-4 py-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white font-semibold text-sm transition-colors border border-purple-400/50"
                style={{
                  boxShadow: '0 0 20px rgba(181,55,242,0.3)',
                }}
              >
                📺 Display
              </Link>
              <Link
                href="/play"
                className="px-4 py-2 rounded-lg bg-orange-600/80 hover:bg-orange-600 text-white font-semibold text-sm transition-colors border border-orange-400/50"
                style={{
                  boxShadow: '0 0 20px rgba(255,107,53,0.3)',
                }}
              >
                🎮 Play
              </Link>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex space-x-2 py-3">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href || (pathname.startsWith('/admin/branding') && tab.href === '/admin')
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-t-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-br from-orange-500 to-pink-600 text-white border-2 border-yellow-400'
                      : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border-2 border-transparent'
                  )}
                  style={isActive ? {
                    boxShadow: '0 0 30px rgba(255,238,50,0.5), inset 0 0 20px rgba(255,255,255,0.2)',
                  } : {}}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="tracking-wide">{tab.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border-2 border-white/10 p-6 min-h-[60vh]"
          style={{
            boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 60px rgba(0,240,255,0.05)',
          }}
        >
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-12 py-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/50 text-sm">
            Prize Wheel Admin Panel • Powered by Next.js & Supabase
          </p>
        </div>
      </footer>
    </div>
  )
}
