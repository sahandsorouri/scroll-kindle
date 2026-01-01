'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBook, getHighlightsByBook } from '@/lib/db'
import { sortHighlights } from '@/lib/normalize'
import type { Book, Highlight } from '@/types/readwise'

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = parseInt(params.bookId as string, 10)

  const [book, setBook] = useState<Book | null>(null)
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadBookData() {
      try {
        const [loadedBook, loadedHighlights] = await Promise.all([
          getBook(bookId),
          getHighlightsByBook(bookId),
        ])

        if (!loadedBook) {
          router.push('/books')
          return
        }

        setBook(loadedBook)
        setHighlights(sortHighlights(loadedHighlights))
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load book:', error)
        setIsLoading(false)
      }
    }

    loadBookData()
  }, [bookId, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading book...</p>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="mb-4 text-lg">Book not found</p>
        <Link href="/books" className="text-blue-600 hover:underline dark:text-blue-400">
          Back to books
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/books"
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← Back to books
          </Link>

          <div className="flex flex-col gap-6 md:flex-row">
            {book.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="h-64 w-auto rounded object-contain"
              />
            )}

            <div className="flex-1">
              <h1 className="mb-2 text-4xl font-bold">{book.title}</h1>
              {book.author && (
                <p className="mb-4 text-xl text-gray-600 dark:text-gray-400">
                  by {book.author}
                </p>
              )}

              <div className="mb-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-gray-200 px-3 py-1 dark:bg-gray-800">
                  {book.category}
                </span>
                <span className="rounded-full bg-gray-200 px-3 py-1 dark:bg-gray-800">
                  {book.source}
                </span>
                <span className="rounded-full bg-gray-200 px-3 py-1 dark:bg-gray-800">
                  {book.num_highlights} highlights
                </span>
              </div>

              {book.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {book.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {book.document_note && (
                <div className="mb-4 rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900/30">
                  <p className="text-sm font-semibold">Note:</p>
                  <p className="text-sm">{book.document_note}</p>
                </div>
              )}

              {book.summary && (
                <div className="mb-4">
                  <p className="text-sm font-semibold">Summary:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{book.summary}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/feed?bookId=${book.user_book_id}`}
                  className="rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Start Scrolling This Book
                </Link>

                {book.readwise_url && (
                  <a
                    href={book.readwise_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border-2 border-gray-800 px-6 py-3 font-semibold transition-colors hover:bg-gray-800 hover:text-white dark:border-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900"
                  >
                    Open in Readwise
                  </a>
                )}

                {book.source_url && (
                  <a
                    href={book.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border-2 border-gray-800 px-6 py-3 font-semibold transition-colors hover:bg-gray-800 hover:text-white dark:border-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900"
                  >
                    View Source
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Highlights list */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">
            Highlights ({highlights.length})
          </h2>

          <div className="space-y-4">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
              >
                <blockquote className="mb-2 text-lg leading-relaxed">
                  &ldquo;{highlight.text}&rdquo;
                </blockquote>

                {highlight.note && (
                  <div className="mb-2 rounded bg-yellow-100 p-2 text-sm dark:bg-yellow-900/30">
                    <p className="font-semibold">Note:</p>
                    <p>{highlight.note}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex flex-wrap gap-2">
                    {highlight.tags.length > 0 &&
                      highlight.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-200 px-2 py-1 dark:bg-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>

                  {highlight.highlighted_at && (
                    <span>
                      {new Date(highlight.highlighted_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {highlight.is_favorite && (
                  <div className="mt-2 text-yellow-500">★ Favorite</div>
                )}
              </div>
            ))}
          </div>

          {highlights.length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-400">
              No highlights found for this book
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

