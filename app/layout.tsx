import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prize Wheel',
  description: 'Real-time prize wheel application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
