import { describe, it, expect } from 'vitest'
import {
  normalizeExportResults,
  sortHighlights,
  deduplicateHighlights,
} from '@/lib/normalize'
import type { ReadwiseExportResponse, Highlight } from '@/types/readwise'
import page1Data from '../fixtures/readwise-export-page-1.json'

describe('normalizeExportResults', () => {
  it('should normalize books and highlights correctly', () => {
    const response = page1Data as ReadwiseExportResponse
    const { books, highlights } = normalizeExportResults(response)

    expect(books).toHaveLength(2)
    expect(highlights).toHaveLength(4) // 2 + 2 highlights

    // Check book normalization
    const book1 = books[0]
    expect(book1.user_book_id).toBe(1)
    expect(book1.title).toBe('Atomic Habits')
    expect(book1.author).toBe('James Clear')
    expect(book1.tags).toEqual(['self-help', 'productivity'])

    // Check highlight normalization
    const highlight1 = highlights[0]
    expect(highlight1.id).toBe(1)
    expect(highlight1.user_book_id).toBe(1)
    expect(highlight1.text).toContain('goals')
    expect(highlight1.is_favorite).toBe(false)
    expect(highlight1.is_deleted).toBe(false)

    // Check deleted highlight
    const deletedHighlight = highlights.find((h) => h.id === 4)
    expect(deletedHighlight?.is_deleted).toBe(true)
  })
})

describe('sortHighlights', () => {
  it('should sort highlights by highlighted_at descending', () => {
    const highlights: Highlight[] = [
      {
        id: 1,
        user_book_id: 1,
        text: 'Old highlight',
        location: 1,
        location_type: 'page',
        highlighted_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated: '2024-01-01T00:00:00Z',
        tags: [],
        is_favorite: false,
        is_deleted: false,
      },
      {
        id: 2,
        user_book_id: 1,
        text: 'New highlight',
        location: 2,
        location_type: 'page',
        highlighted_at: '2024-12-15T00:00:00Z',
        created_at: '2024-12-15T00:00:00Z',
        updated: '2024-12-15T00:00:00Z',
        tags: [],
        is_favorite: false,
        is_deleted: false,
      },
    ]

    const sorted = sortHighlights(highlights, false)

    expect(sorted[0].id).toBe(2) // Newer first
    expect(sorted[1].id).toBe(1)
  })

  it('should use created_at as fallback when highlighted_at is missing', () => {
    const highlights: Highlight[] = [
      {
        id: 1,
        user_book_id: 1,
        text: 'Highlight',
        location: 1,
        location_type: 'page',
        highlighted_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated: '2024-01-01T00:00:00Z',
        tags: [],
        is_favorite: false,
        is_deleted: false,
      },
      {
        id: 2,
        user_book_id: 1,
        text: 'Highlight',
        location: 2,
        location_type: 'page',
        highlighted_at: null,
        created_at: '2024-12-15T00:00:00Z',
        updated: '2024-12-15T00:00:00Z',
        tags: [],
        is_favorite: false,
        is_deleted: false,
      },
    ]

    const sorted = sortHighlights(highlights, false)

    expect(sorted[0].id).toBe(2)
    expect(sorted[1].id).toBe(1)
  })

  it('should use id as stable tie-breaker', () => {
    const sameDate = '2024-12-15T00:00:00Z'
    const highlights: Highlight[] = [
      {
        id: 10,
        user_book_id: 1,
        text: 'Highlight',
        location: 1,
        location_type: 'page',
        highlighted_at: sameDate,
        created_at: sameDate,
        updated: sameDate,
        tags: [],
        is_favorite: false,
        is_deleted: false,
      },
      {
        id: 5,
        user_book_id: 1,
        text: 'Highlight',
        location: 2,
        location_type: 'page',
        highlighted_at: sameDate,
        created_at: sameDate,
        updated: sameDate,
        tags: [],
        is_favorite: false,
        is_deleted: false,
      },
    ]

    const sorted = sortHighlights(highlights, false)

    expect(sorted[0].id).toBe(10) // Higher id first
    expect(sorted[1].id).toBe(5)
  })

  it('should randomize when randomize flag is true', () => {
    const highlights: Highlight[] = []
    for (let i = 1; i <= 20; i++) {
      highlights.push({
        id: i,
        user_book_id: 1,
        text: `Highlight ${i}`,
        location: i,
        location_type: 'page',
        highlighted_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated: '2024-01-01T00:00:00Z',
        tags: [],
        is_favorite: false,
        is_deleted: false,
      })
    }

    const sorted1 = sortHighlights(highlights, true)
    const sorted2 = sortHighlights(highlights, true)

    // Should be randomized (very unlikely to be identical twice)
    const isDifferent = sorted1.some((h, i) => h.id !== sorted2[i].id)
    expect(isDifferent).toBe(true)
  })
})

describe('deduplicateHighlights', () => {
  it('should merge highlights by id', () => {
    const existing: Highlight[] = [
      {
        id: 1,
        user_book_id: 1,
        text: 'Old text',
        location: 1,
        location_type: 'page',
        highlighted_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated: '2024-01-01T00:00:00Z',
        tags: [],
        is_favorite: true, // User favorited
        is_deleted: false,
      },
    ]

    const incoming: Highlight[] = [
      {
        id: 1,
        user_book_id: 1,
        text: 'Updated text',
        location: 1,
        location_type: 'page',
        highlighted_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated: '2024-12-15T00:00:00Z',
        tags: ['new-tag'],
        is_favorite: false,
        is_deleted: false,
      },
    ]

    const deduplicated = deduplicateHighlights(existing, incoming)

    expect(deduplicated).toHaveLength(1)
    expect(deduplicated[0].text).toBe('Updated text') // Updated
    expect(deduplicated[0].is_favorite).toBe(true) // Preserved from local
    expect(deduplicated[0].tags).toEqual(['new-tag']) // Updated
  })

  it('should add new highlights', () => {
    const existing: Highlight[] = [
      {
        id: 1,
        user_book_id: 1,
        text: 'Existing',
        location: 1,
        location_type: 'page',
        highlighted_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated: '2024-01-01T00:00:00Z',
        tags: [],
        is_favorite: false,
        is_deleted: false,
      },
    ]

    const incoming: Highlight[] = [
      {
        id: 2,
        user_book_id: 1,
        text: 'New highlight',
        location: 2,
        location_type: 'page',
        highlighted_at: '2024-12-15T00:00:00Z',
        created_at: '2024-12-15T00:00:00Z',
        updated: '2024-12-15T00:00:00Z',
        tags: [],
        is_favorite: false,
        is_deleted: false,
      },
    ]

    const deduplicated = deduplicateHighlights(existing, incoming)

    expect(deduplicated).toHaveLength(2)
    expect(deduplicated.find((h) => h.id === 1)).toBeDefined()
    expect(deduplicated.find((h) => h.id === 2)).toBeDefined()
  })
})

