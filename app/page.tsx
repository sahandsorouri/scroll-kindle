'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { saveBooks, saveHighlights } from '@/lib/db'
import { DEMO_BOOKS, DEMO_HIGHLIGHTS } from '@/lib/demo-data'

export default function Home() {
  const router = useRouter()

  const handleDemoMode = async () => {
    try {
      // Load demo data into IndexedDB
      await saveBooks(DEMO_BOOKS)
      await saveHighlights(DEMO_HIGHLIGHTS)
      
      // Navigate to feed
      router.push('/feed?demo=true')
    } catch (error) {
      console.error('Failed to load demo data:', error)
      alert('Failed to load demo. Please try again.')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="z-10 w-full max-w-2xl text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">
          QuoteScroll
        </h1>
        
        <p className="mb-8 text-xl text-gray-600 dark:text-gray-400 md:text-2xl">
          Scroll your own highlights instead of doomscrolling
        </p>

        <p className="mb-12 text-base text-gray-500 dark:text-gray-500 md:text-lg">
          Turn your Readwise highlights into a TikTok-style vertical feed.
          <br />
          Rediscover your favorite quotes with every scroll.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={handleDemoMode}
            className="rounded-lg bg-gray-800 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:ring-gray-700"
          >
            Try Demo
          </button>

          <Link
            href="/connect"
            className="rounded-lg border-2 border-gray-800 px-8 py-4 text-lg font-semibold text-gray-800 transition-colors hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-100 dark:text-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900 dark:focus:ring-gray-700"
          >
            Connect Readwise
          </Link>
        </div>

        <div className="mt-12 rounded-lg bg-gray-100 p-6 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400">
          <p className="font-semibold">🔒 Privacy First</p>
          <p className="mt-2">
            Your Readwise token is stored locally on your device.
            <br />
            All data is private. No server-side storage.
          </p>
        </div>

        <div className="mt-8 text-xs text-gray-400 dark:text-gray-600">
          <p>
            QuoteScroll is an unofficial tool and is not affiliated with Readwise.
          </p>
        </div>
      </div>
    </main>
  )
}

