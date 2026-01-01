// Readwise API Response Types

export interface ReadwiseExportResponse {
  count: number
  nextPageCursor: string | null
  results: ReadwiseBookResult[]
}

export interface ReadwiseBookResult {
  user_book_id: number
  title: string
  author?: string
  category: string
  source: string
  num_highlights: number
  last_highlight_at: string | null
  updated: string
  cover_image_url?: string
  highlights_url: string
  source_url?: string
  asin?: string
  tags?: ReadwiseTag[]
  document_note?: string
  summary?: string
  highlights?: ReadwiseHighlight[]
  readwise_url?: string
}

export interface ReadwiseHighlight {
  id: number
  text: string
  note?: string
  location: number
  location_type: string
  highlighted_at: string | null
  url?: string
  color?: string
  updated: string
  book_id: number
  tags?: ReadwiseTag[]
  is_favorite?: boolean
  is_discard?: boolean
  readwise_url?: string
}

export interface ReadwiseTag {
  name: string
}

// Internal Application Types

export interface Book {
  user_book_id: number
  title: string
  author?: string
  category: string
  source: string
  num_highlights: number
  last_highlight_at: string | null
  updated: string
  cover_image_url?: string
  highlights_url: string
  source_url?: string
  asin?: string
  tags: string[]
  document_note?: string
  summary?: string
  readwise_url?: string
}

export interface Highlight {
  id: number
  user_book_id: number
  text: string
  note?: string
  location: number
  location_type: string
  highlighted_at: string | null
  created_at: string
  updated: string
  url?: string
  color?: string
  tags: string[]
  is_favorite: boolean
  is_deleted: boolean
  readwise_url?: string
}

export interface ImportProgress {
  status: 'idle' | 'loading' | 'success' | 'error'
  currentPage: number
  totalHighlights: number
  totalBooks: number
  error?: string
  nextPageCursor: string | null
  lastSyncTimestamp?: string
}

export interface FilterOptions {
  bookId?: number
  category?: string
  searchQuery?: string
  showDeleted?: boolean
  showFavoritesOnly?: boolean
  randomize?: boolean
  showSampleQuotes?: boolean
}

