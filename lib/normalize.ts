// Data normalization utilities
import type {
  ReadwiseExportResponse,
  ReadwiseBookResult,
  ReadwiseHighlight,
  Book,
  Highlight,
} from '@/types/readwise'

export function normalizeBook(bookResult: ReadwiseBookResult): Book {
  return {
    user_book_id: bookResult.user_book_id,
    title: bookResult.title,
    author: bookResult.author,
    category: bookResult.category,
    source: bookResult.source,
    num_highlights: bookResult.num_highlights,
    last_highlight_at: bookResult.last_highlight_at,
    updated: bookResult.updated,
    cover_image_url: bookResult.cover_image_url,
    highlights_url: bookResult.highlights_url,
    source_url: bookResult.source_url,
    asin: bookResult.asin,
    tags: bookResult.tags?.map((t) => t.name) || [],
    document_note: bookResult.document_note,
    summary: bookResult.summary,
    readwise_url: bookResult.readwise_url,
  }
}

export function normalizeHighlight(
  highlight: ReadwiseHighlight,
  bookId: number
): Highlight {
  return {
    id: highlight.id,
    user_book_id: bookId,
    text: highlight.text,
    note: highlight.note,
    location: highlight.location,
    location_type: highlight.location_type,
    highlighted_at: highlight.highlighted_at,
    created_at: highlight.highlighted_at || highlight.updated,
    updated: highlight.updated,
    url: highlight.url,
    color: highlight.color,
    tags: highlight.tags?.map((t) => t.name) || [],
    is_favorite: highlight.is_favorite || false,
    is_deleted: highlight.is_discard || false,
    readwise_url: highlight.readwise_url,
  }
}

export interface NormalizedData {
  books: Book[]
  highlights: Highlight[]
}

export function normalizeExportResults(
  response: ReadwiseExportResponse
): NormalizedData {
  const books: Book[] = []
  const highlights: Highlight[] = []

  for (const bookResult of response.results) {
    // Check if book actually has highlights
    const hasHighlights = bookResult.highlights && 
                         Array.isArray(bookResult.highlights) && 
                         bookResult.highlights.length > 0

    // ONLY save books that have highlights
    if (hasHighlights) {
      books.push(normalizeBook(bookResult))

      for (const highlight of bookResult.highlights!) {
        highlights.push(normalizeHighlight(highlight, bookResult.user_book_id))
      }
    } else {
      console.log(`⚠️ Skipping book "${bookResult.title}" - no highlights found`)
    }
  }

  return { books, highlights }
}

export function sortHighlights(highlights: Highlight[], randomize: boolean = false): Highlight[] {
  const sorted = [...highlights].sort((a, b) => {
    // Primary sort: newest highlighted_at first
    const dateA = a.highlighted_at || a.created_at
    const dateB = b.highlighted_at || b.created_at

    if (dateA && dateB) {
      const comparison = new Date(dateB).getTime() - new Date(dateA).getTime()
      if (comparison !== 0) return comparison
    }

    // If dates are equal or missing, sort by created_at
    if (a.created_at && b.created_at) {
      const comparison =
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (comparison !== 0) return comparison
    }

    // Stable tie-break by id
    return b.id - a.id
  })

  // Shuffle if randomize is enabled
  if (randomize) {
    return shuffleArray(sorted)
  }

  return sorted
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function deduplicateHighlights(
  existing: Highlight[],
  incoming: Highlight[]
): Highlight[] {
  const map = new Map<number, Highlight>()

  // Add existing highlights
  for (const highlight of existing) {
    map.set(highlight.id, highlight)
  }

  // Merge or add incoming highlights
  for (const highlight of incoming) {
    const existingHighlight = map.get(highlight.id)
    if (existingHighlight) {
      // Merge: keep is_favorite from local, update other fields
      map.set(highlight.id, {
        ...highlight,
        is_favorite: existingHighlight.is_favorite,
      })
    } else {
      map.set(highlight.id, highlight)
    }
  }

  return Array.from(map.values())
}

