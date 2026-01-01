import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QuoteScroll - Your Readwise highlights in a doomscroll feed',
  description: 'Turn your Readwise highlights into a TikTok-style vertical feed. Scroll your own highlights instead of doomscrolling.',
  openGraph: {
    title: 'QuoteScroll',
    description: 'Scroll your own highlights instead of doomscrolling.',
    type: 'website',
  },
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

