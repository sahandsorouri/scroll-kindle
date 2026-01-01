// Import Manager - handles data import with pagination
import { fetchExport, ApiError } from './api-client'
import { normalizeExportResults, deduplicateHighlights, sortHighlights } from './normalize'
import {
  saveBooks,
  saveHighlights,
  getAllHighlights,
  setImportProgress,
  getImportProgress,
} from './db'
import { generateSampleHighlights } from './sample-quotes'
import type { ImportProgress } from '@/types/readwise'

export interface ImportManagerCallbacks {
  onProgress?: (progress: ImportProgress) => void
  onComplete?: () => void
  onError?: (error: string) => void
}

export class ImportManager {
  private isRunning = false
  private callbacks: ImportManagerCallbacks

  constructor(callbacks: ImportManagerCallbacks = {}) {
    this.callbacks = callbacks
  }

  async startImport(
    token: string,
    options: { includeDeleted?: boolean; updatedAfter?: string } = {}
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('Import already in progress')
    }

    this.isRunning = true

    try {
      let pageCursor: string | null = null
      let pageCount = 0
      let totalHighlights = 0
      let totalBooks = 0
      let firstPageLoaded = false

      do {
        pageCount++

        // Fetch page
        const response = await fetchExport(token, {
          pageCursor: pageCursor || undefined,
          includeDeleted: options.includeDeleted,
          updatedAfter: options.updatedAfter,
        })

        // Normalize data
        const { books, highlights } = normalizeExportResults(response)

        // Deduplicate with existing data
        const existingHighlights = await getAllHighlights()
        const mergedHighlights = deduplicateHighlights(existingHighlights, highlights)

        // Save to IndexedDB
        await saveBooks(books)
        await saveHighlights(mergedHighlights)

        // Update counters
        totalHighlights = mergedHighlights.length
        totalBooks += books.length

        // Update progress
        const progress: ImportProgress = {
          status: 'loading',
          currentPage: pageCount,
          totalHighlights,
          totalBooks,
          nextPageCursor: response.nextPageCursor,
          lastSyncTimestamp: new Date().toISOString(),
        }

        await setImportProgress(progress)
        this.callbacks.onProgress?.(progress)

        // Call onComplete after first page so UI is immediately usable
        if (!firstPageLoaded) {
          firstPageLoaded = true
          this.callbacks.onComplete?.()
        }

        pageCursor = response.nextPageCursor

        // Rate limiting: wait a bit between requests
        if (pageCursor) {
          await this.sleep(500)
        }
      } while (pageCursor)

      // Mark complete
      const finalProgress: ImportProgress = {
        status: 'success',
        currentPage: pageCount,
        totalHighlights,
        totalBooks,
        nextPageCursor: null,
        lastSyncTimestamp: new Date().toISOString(),
      }

      await setImportProgress(finalProgress)
      this.callbacks.onProgress?.(finalProgress)
    } catch (error) {
      console.error('Import error:', error)
      const apiError = error as ApiError
      
      // Handle rate limiting with backoff
      if (apiError.status === 429 && apiError.retryAfter) {
        const retrySeconds = apiError.retryAfter
        const errorMessage = `Rate limited. Please wait ${retrySeconds} seconds and try again.`

        const progress: ImportProgress = {
          status: 'error',
          currentPage: 0,
          totalHighlights: 0,
          totalBooks: 0,
          error: errorMessage,
          nextPageCursor: null,
        }

        await setImportProgress(progress)
        this.callbacks.onProgress?.(progress)
        this.callbacks.onError?.(errorMessage)
      } else {
        const errorMessage = apiError.error || (error instanceof Error ? error.message : 'Import failed')

        const progress: ImportProgress = {
          status: 'error',
          currentPage: 0,
          totalHighlights: 0,
          totalBooks: 0,
          error: errorMessage,
          nextPageCursor: null,
        }

        await setImportProgress(progress)
        this.callbacks.onProgress?.(progress)
        this.callbacks.onError?.(errorMessage)
      }
    } finally {
      this.isRunning = false
    }
  }

  async resumeImport(token: string): Promise<void> {
    const progress = await getImportProgress()

    if (!progress || !progress.nextPageCursor) {
      throw new Error('No import to resume')
    }

    // Continue from last cursor
    await this.startImport(token, {
      // Use the cursor from progress if needed
    })
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export function getSortedHighlights(
  highlights: import('@/types/readwise').Highlight[],
  filters: import('@/types/readwise').FilterOptions = {},
  addSamples: boolean = false
): import('@/types/readwise').Highlight[] {
  let filtered = [...highlights]

  // Add sample highlights if enabled and user has few highlights
  if (addSamples && filtered.length < 50) {
    const samples = generateSampleHighlights(filtered)
    filtered = [...filtered, ...samples]
  }

  // Filter by book (skip for sample highlights which have negative IDs)
  if (filters.bookId && filters.bookId > 0) {
    filtered = filtered.filter((h) => h.user_book_id === filters.bookId)
  }

  // Filter by deleted
  if (!filters.showDeleted) {
    filtered = filtered.filter((h) => !h.is_deleted)
  }

  // Filter by favorites (samples can't be favorited)
  if (filters.showFavoritesOnly) {
    filtered = filtered.filter((h) => h.is_favorite)
  }

  // Filter by search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(
      (h) =>
        h.text.toLowerCase().includes(query) ||
        h.note?.toLowerCase().includes(query)
    )
  }

  return sortHighlights(filtered, filters.randomize || false)
}

