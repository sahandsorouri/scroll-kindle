'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getAllHighlights, getAllBooks, toggleFavorite } from '@/lib/db'
import { clearToken } from '@/lib/storage'
import { getSortedHighlights } from '@/lib/import-manager'
import { isSampleHighlight } from '@/lib/sample-quotes'
import type { Highlight, Book, FilterOptions } from '@/types/readwise'

function FeedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'
  const bookIdParam = searchParams.get('bookId')

  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filters, setFilters] = useState<FilterOptions>({
    showDeleted: false,
    bookId: bookIdParam ? parseInt(bookIdParam, 10) : undefined,
    randomize: true, // Enable randomization by default
    showSampleQuotes: false, // Disable sample quotes by default - ONLY show user's own highlights
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedHighlights, loadedBooks] = await Promise.all([
          getAllHighlights(),
          getAllBooks(),
        ])

        setBooks(loadedBooks)

        if (loadedHighlights.length === 0 && !isDemo) {
          // No data and not demo mode, redirect to home
          router.push('/')
          return
        }

        // Add sample highlights ONLY if explicitly enabled in filters AND user has few highlights
        const addSamples = filters.showSampleQuotes && loadedHighlights.length < 50 && !isDemo
        console.log(`\n=== FEED DATA LOADED ===`)
        console.log(`📊 Total highlights from DB: ${loadedHighlights.length}`)
        console.log(`📚 Total books from DB: ${loadedBooks.length}`)
        console.log(`📚 Sample quotes enabled: ${filters.showSampleQuotes}`)
        console.log(`📚 Will add samples: ${addSamples}`)
        
        // Group highlights by book for debugging
        const byBook = loadedHighlights.reduce((acc, h) => {
          const book = loadedBooks.find(b => b.user_book_id === h.user_book_id)
          const bookTitle = book?.title || `Unknown Book (ID: ${h.user_book_id})`
          acc[bookTitle] = (acc[bookTitle] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        console.log('📖 YOUR highlights by book:')
        Object.entries(byBook).forEach(([book, count]) => {
          console.log(`   - ${book}: ${count} highlights`)
        })
        
        // Show books without highlights
        const booksWithoutHighlights = loadedBooks.filter(b => 
          !loadedHighlights.some(h => h.user_book_id === b.user_book_id)
        )
        if (booksWithoutHighlights.length > 0) {
          console.warn(`⚠️ Books in DB but NO highlights found (${booksWithoutHighlights.length}):`)
          booksWithoutHighlights.forEach(b => {
            console.warn(`   - "${b.title}" (ID: ${b.user_book_id}) - claims ${b.num_highlights} highlights`)
          })
        }
        
        const sorted = getSortedHighlights(loadedHighlights, filters, addSamples)
        const userHighlights = sorted.filter(h => h.id > 0).length
        const sampleHighlights = sorted.filter(h => h.id < 0).length
        console.log(`✅ Final feed - YOUR highlights: ${userHighlights}, Sample quotes: ${sampleHighlights}, Total: ${sorted.length}`)
        setHighlights(sorted)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load data:', error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [filters, router])

  // Apply search filter
  const filteredHighlights = searchQuery
    ? highlights.filter(
        (h) =>
          h.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.note?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : highlights

  const currentHighlight = filteredHighlights[currentIndex]
  const currentBook = books.find((b) => b.user_book_id === currentHighlight?.user_book_id)

  // Navigation
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, filteredHighlights.length - 1))
  }, [filteredHighlights.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings || showFilters) return

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        goToPrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrev, showSettings, showFilters])

  // Mouse wheel navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (showSettings || showFilters) return
      if (isScrollingRef.current) return

      e.preventDefault()

      isScrollingRef.current = true

      if (e.deltaY > 0) {
        goToNext()
      } else if (e.deltaY < 0) {
        goToPrev()
      }

      setTimeout(() => {
        isScrollingRef.current = false
      }, 300)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [goToNext, goToPrev, showSettings, showFilters])

  // Touch navigation
  useEffect(() => {
    let touchStart = 0
    let touchEnd = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEnd = e.changedTouches[0].clientY

      const diff = touchStart - touchEnd

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToNext()
        } else {
          goToPrev()
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('touchstart', handleTouchStart)
      container.addEventListener('touchend', handleTouchEnd)

      return () => {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [goToNext, goToPrev])

  const handleCopyText = () => {
    if (currentHighlight) {
      navigator.clipboard.writeText(currentHighlight.text)
      alert('Copied to clipboard!')
    }
  }

  const handleCopyFormatted = () => {
    if (currentHighlight && currentBook) {
      const formatted = `"${currentHighlight.text}"\n\n— ${currentBook.title}${currentBook.author ? ` by ${currentBook.author}` : ''}`
      navigator.clipboard.writeText(formatted)
      alert('Copied formatted quote!')
    }
  }

  const handleToggleFavorite = async () => {
    if (currentHighlight && !isSampleHighlight(currentHighlight)) {
      await toggleFavorite(currentHighlight.id)
      // Reload highlights
      const loadedHighlights = await getAllHighlights()
      const addSamples = filters.showSampleQuotes && loadedHighlights.length < 50 && !isDemo
      const sorted = getSortedHighlights(loadedHighlights, filters, addSamples)
      setHighlights(sorted)
    }
  }

  const handleOpenInReadwise = () => {
    if (currentHighlight?.readwise_url) {
      window.open(currentHighlight.readwise_url, '_blank')
    } else if (currentBook?.readwise_url) {
      window.open(currentBook.readwise_url, '_blank')
    }
  }

  const handleForgetToken = () => {
    if (confirm('Are you sure you want to forget your token and clear all data?')) {
      clearToken()
      router.push('/')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading highlights...</p>
      </div>
    )
  }

  if (filteredHighlights.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6">
        <p className="mb-4 text-lg">No highlights found</p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Clear search
          </button>
        )}
        <Link href="/" className="mt-4 text-blue-600 hover:underline dark:text-blue-400">
          Go home
        </Link>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden bg-white dark:bg-black">
      {/* Top bar - mobile optimized */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-2 text-white md:p-4">
        <Link href="/" className="text-xs hover:underline md:text-sm">
          ← Home
        </Link>
        <div className="flex gap-1 md:gap-2">
          <button
            onClick={() => setShowFilters(true)}
            className="rounded px-2 py-1 text-xs transition-colors hover:bg-white/20 active:bg-white/30 md:px-3 md:text-sm"
            aria-label="Filters"
          >
            🔍
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="rounded px-2 py-1 text-xs transition-colors hover:bg-white/20 active:bg-white/30 md:px-3 md:text-sm"
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Main highlight card */}
      <div className="flex h-full flex-col items-center justify-center overflow-y-auto p-4 md:p-12">
        <div className="w-full max-w-3xl">
          {/* Clear badge indicating source */}
          <div className="mb-3 flex justify-center md:mb-4">
            {isSampleHighlight(currentHighlight) ? (
              <span className="rounded-full bg-blue-500 px-3 py-1.5 text-xs font-bold text-white md:px-4 md:py-2">
                📚 SAMPLE QUOTE
              </span>
            ) : (
              <span className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white md:px-4 md:py-2">
                ✨ YOUR HIGHLIGHT
              </span>
            )}
          </div>

          {currentBook?.cover_image_url && !isSampleHighlight(currentHighlight) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentBook.cover_image_url}
              alt={currentBook.title}
              className="mx-auto mb-4 h-24 w-auto rounded object-contain md:mb-6 md:h-32"
            />
          )}

          <blockquote className="mb-6 max-h-[60vh] overflow-y-auto break-words text-lg font-light leading-relaxed md:mb-8 md:text-2xl lg:text-4xl">
            &ldquo;{currentHighlight.text}&rdquo;
          </blockquote>

          {currentHighlight.note && (
            <div className={`mb-4 max-h-[30vh] overflow-y-auto rounded-lg p-3 text-xs md:mb-6 md:p-4 md:text-sm ${isSampleHighlight(currentHighlight) ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
              <p className="font-semibold">{isSampleHighlight(currentHighlight) ? '📚 Sample Quote Info:' : '📝 Your Note:'}</p>
              <p className="mt-1">{currentHighlight.note}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400 md:gap-4 md:text-sm">
            <p className="font-semibold">
              {isSampleHighlight(currentHighlight) 
                ? currentHighlight.note?.match(/from "(.*?)" by (.*?)\./)?.[1] || 'Sample Quote'
                : (currentBook?.title || 'Unknown Book')}
              {!isSampleHighlight(currentHighlight) && currentBook?.author && ` by ${currentBook.author}`}
            </p>
            {currentHighlight.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 md:gap-2">
                {currentHighlight.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom action bar - mobile optimized */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-2 text-white md:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 md:gap-2">
            {!isSampleHighlight(currentHighlight) && (
              <button
                onClick={handleToggleFavorite}
                className="rounded px-2 py-1.5 text-lg transition-colors hover:bg-white/20 active:bg-white/30 md:px-3 md:py-2"
                aria-label="Toggle favorite"
              >
                {currentHighlight?.is_favorite ? '★' : '☆'}
              </button>
            )}
            <button
              onClick={handleCopyText}
              className="rounded px-2 py-1.5 text-xs transition-colors hover:bg-white/20 active:bg-white/30 md:px-3 md:py-2 md:text-sm"
            >
              Copy
            </button>
            <button
              onClick={handleCopyFormatted}
              className="hidden rounded px-2 py-1.5 text-xs transition-colors hover:bg-white/20 active:bg-white/30 md:inline-block md:px-3 md:py-2 md:text-sm"
            >
              Copy Quote
            </button>
            {(currentHighlight?.readwise_url || currentBook?.readwise_url) && (
              <button
                onClick={handleOpenInReadwise}
                className="hidden rounded px-2 py-1.5 text-xs transition-colors hover:bg-white/20 active:bg-white/30 md:inline-block md:px-3 md:py-2 md:text-sm"
              >
                Open in Readwise
              </button>
            )}
          </div>

          <p className="text-xs font-medium md:text-sm">
            {currentIndex + 1} / {filteredHighlights.length}
          </p>
        </div>
      </div>

      {/* Settings Modal - mobile optimized */}
      {showSettings && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/80 md:items-center">
          <div className="w-full max-w-md rounded-t-lg bg-white p-4 dark:bg-gray-900 md:rounded-lg md:p-6">
            <h2 className="mb-3 text-xl font-bold md:mb-4 md:text-2xl">Settings</h2>

            <div className="space-y-3 md:space-y-4">
              <button
                onClick={handleForgetToken}
                className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 active:bg-red-800 md:text-base"
              >
                Forget Token & Clear Data
              </button>

              <Link
                href="/books"
                className="block w-full rounded-lg border-2 border-gray-800 px-4 py-2.5 text-center text-sm font-medium hover:bg-gray-800 hover:text-white active:bg-gray-700 dark:border-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900 md:text-base"
              >
                View All Books
              </Link>

              {!isDemo && (
                <button
                  onClick={() => router.push('/connect')}
                  className="w-full rounded-lg border-2 border-gray-800 px-4 py-2.5 text-sm font-medium hover:bg-gray-800 hover:text-white active:bg-gray-700 dark:border-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900 md:text-base"
                >
                  Re-import Highlights
                </button>
              )}
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="mt-4 w-full rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 md:mt-6 md:text-base"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Filters Modal - mobile optimized */}
      {showFilters && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/80 md:items-center">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-lg bg-white p-4 dark:bg-gray-900 md:rounded-lg md:p-6">
            <h2 className="mb-3 text-xl font-bold md:mb-4 md:text-2xl">Filters</h2>

            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium md:mb-2 md:text-sm">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search highlights..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 md:px-4 md:text-base"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium md:mb-2 md:text-sm">Filter by Book</label>
                <select
                  value={filters.bookId || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      bookId: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 md:px-4 md:text-base"
                >
                  <option value="">All Books</option>
                  {books.map((book) => (
                    <option key={book.user_book_id} value={book.user_book_id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showFavoritesOnly || false}
                  onChange={(e) =>
                    setFilters({ ...filters, showFavoritesOnly: e.target.checked })
                  }
                  className="mr-2 h-4 w-4"
                />
                <span className="text-xs md:text-sm">Show favorites only</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showDeleted || false}
                  onChange={(e) =>
                    setFilters({ ...filters, showDeleted: e.target.checked })
                  }
                  className="mr-2 h-4 w-4"
                />
                <span className="text-xs md:text-sm">Show deleted highlights</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.randomize ?? true}
                  onChange={(e) =>
                    setFilters({ ...filters, randomize: e.target.checked })
                  }
                  className="mr-2 h-4 w-4"
                />
                <span className="text-xs md:text-sm">Randomize order (mix books)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showSampleQuotes ?? false}
                  onChange={(e) =>
                    setFilters({ ...filters, showSampleQuotes: e.target.checked })
                  }
                  className="mr-2 h-4 w-4"
                />
                <span className="text-xs md:text-sm">Show sample quotes if I have &lt; 50 highlights</span>
              </label>
            </div>

            <button
              onClick={() => {
                setShowFilters(false)
                setCurrentIndex(0)
              }}
              className="mt-4 w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 active:bg-gray-600 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 md:mt-6 md:text-base"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><p className="text-lg">Loading...</p></div>}>
      <FeedContent />
    </Suspense>
  )
}

