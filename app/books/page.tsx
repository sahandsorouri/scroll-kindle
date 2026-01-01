'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllBooks } from '@/lib/db'
import type { Book } from '@/types/readwise'

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  useEffect(() => {
    async function loadBooks() {
      try {
        const loadedBooks = await getAllBooks()
        // Sort by last_highlight_at (most recent first)
        loadedBooks.sort((a, b) => {
          const dateA = a.last_highlight_at ? new Date(a.last_highlight_at).getTime() : 0
          const dateB = b.last_highlight_at ? new Date(b.last_highlight_at).getTime() : 0
          return dateB - dateA
        })
        setBooks(loadedBooks)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load books:', error)
        setIsLoading(false)
      }
    }

    loadBooks()
  }, [])

  const filteredBooks = books.filter((book) => {
    // Only show books that have at least 1 highlight
    const hasHighlights = book.num_highlights > 0

    const matchesSearch =
      !searchQuery ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !categoryFilter || book.category === categoryFilter

    return hasHighlights && matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(books.map((b) => b.category))).sort()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading books...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Your Books</h1>
          <Link
            href="/feed"
            className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Back to Feed
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => (
            <Link
              key={book.user_book_id}
              href={`/books/${book.user_book_id}`}
              className="group rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-lg dark:border-gray-800"
            >
              <div className="flex gap-4">
                {book.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="h-32 w-auto rounded object-contain"
                  />
                )}
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold group-hover:underline">{book.title}</h3>
                  {book.author && (
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      by {book.author}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-500">
                    <span className="rounded-full bg-gray-200 px-2 py-1 dark:bg-gray-800">
                      {book.category}
                    </span>
                    <span className="rounded-full bg-gray-200 px-2 py-1 dark:bg-gray-800">
                      {book.num_highlights} highlights
                    </span>
                  </div>
                  {book.last_highlight_at && (
                    <p className="mt-2 text-xs text-gray-400">
                      Last: {new Date(book.last_highlight_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {book.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {book.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {tag}
                    </span>
                  ))}
                  {book.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{book.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No books found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-blue-600 hover:underline dark:text-blue-400"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

