import { describe, it, expect } from 'vitest'
import { getSortedHighlights } from '@/lib/import-manager'
import type { Highlight, FilterOptions } from '@/types/readwise'

const mockHighlights: Highlight[] = [
  {
    id: 1,
    user_book_id: 1,
    text: 'Highlight 1',
    location: 1,
    location_type: 'page',
    highlighted_at: '2024-12-15T00:00:00Z',
    created_at: '2024-12-15T00:00:00Z',
    updated: '2024-12-15T00:00:00Z',
    tags: [],
    is_favorite: false,
    is_deleted: false,
  },
  {
    id: 2,
    user_book_id: 2,
    text: 'Highlight 2 with search keyword',
    location: 2,
    location_type: 'page',
    highlighted_at: '2024-12-14T00:00:00Z',
    created_at: '2024-12-14T00:00:00Z',
    updated: '2024-12-14T00:00:00Z',
    tags: [],
    is_favorite: true,
    is_deleted: false,
  },
  {
    id: 3,
    user_book_id: 1,
    text: 'Deleted highlight',
    location: 3,
    location_type: 'page',
    highlighted_at: '2024-12-13T00:00:00Z',
    created_at: '2024-12-13T00:00:00Z',
    updated: '2024-12-13T00:00:00Z',
    tags: [],
    is_favorite: false,
    is_deleted: true,
  },
]

describe('getSortedHighlights', () => {
  it('should return non-deleted highlights sorted by date', () => {
    // By default, deleted highlights are hidden
    const result = getSortedHighlights(mockHighlights, {})

    expect(result).toHaveLength(2) // 2 non-deleted
    expect(result[0].id).toBe(1) // Most recent
  })

  it('should filter by bookId', () => {
    const filters: FilterOptions = { bookId: 1 }
    const result = getSortedHighlights(mockHighlights, filters)

    // Book 1 has 2 highlights, 1 is deleted, so only 1 non-deleted
    expect(result).toHaveLength(1)
    expect(result.every((h) => h.user_book_id === 1)).toBe(true)
  })

  it('should hide deleted highlights by default', () => {
    const filters: FilterOptions = { showDeleted: false }
    const result = getSortedHighlights(mockHighlights, filters)

    expect(result).toHaveLength(2)
    expect(result.every((h) => !h.is_deleted)).toBe(true)
  })

  it('should show deleted highlights when enabled', () => {
    const filters: FilterOptions = { showDeleted: true }
    const result = getSortedHighlights(mockHighlights, filters)

    expect(result).toHaveLength(3)
  })

  it('should filter by favorites', () => {
    const filters: FilterOptions = { showFavoritesOnly: true }
    const result = getSortedHighlights(mockHighlights, filters)

    expect(result).toHaveLength(1)
    expect(result[0].is_favorite).toBe(true)
  })

  it('should filter by search query', () => {
    const filters: FilterOptions = { searchQuery: 'search keyword' }
    const result = getSortedHighlights(mockHighlights, filters)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('should apply multiple filters', () => {
    const filters: FilterOptions = {
      bookId: 1,
      showDeleted: false,
    }
    const result = getSortedHighlights(mockHighlights, filters)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })
})

