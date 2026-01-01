import type { Metadata, Viewport } from 'next'
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="overscroll-none">{children}</body>
    </html>
  )
}

