import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prize Wheel - Roue de Loterie',
  description: 'Application de roue de loterie temps réel pour événements',
}

async function getSettings() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('primary_color, secondary_color, wheel_bg, segment_text_color')
    .eq('id', 1)
    .single()

  return data || {
    primary_color: '#f59e0b',
    secondary_color: '#ef4444',
    wheel_bg: '#ffffff',
    segment_text_color: '#ffffff',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  return (
    <html lang="fr">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary-color: ${settings.primary_color};
            --secondary-color: ${settings.secondary_color};
            --wheel-bg: ${settings.wheel_bg};
            --segment-text-color: ${settings.segment_text_color};
          }
        `}} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
