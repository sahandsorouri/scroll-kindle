// IndexedDB Persistence Layer
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Book, Highlight, ImportProgress } from '@/types/readwise'

interface QuoteScrollDB extends DBSchema {
  books: {
    key: number
    value: Book
    indexes: {
      category: string
      updated: string
    }
  }
  highlights: {
    key: number
    value: Highlight
    indexes: {
      user_book_id: number
      highlighted_at: string
      is_favorite: number
      is_deleted: number
    }
  }
  metadata: {
    key: string
    value: {
      key: string
      value: string | number | ImportProgress
    }
  }
}

const DB_NAME = 'quotescroll'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<QuoteScrollDB> | null = null

export async function getDB(): Promise<IDBPDatabase<QuoteScrollDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<QuoteScrollDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Books store
      if (!db.objectStoreNames.contains('books')) {
        const bookStore = db.createObjectStore('books', { keyPath: 'user_book_id' })
        bookStore.createIndex('category', 'category')
        bookStore.createIndex('updated', 'updated')
      }

      // Highlights store
      if (!db.objectStoreNames.contains('highlights')) {
        const highlightStore = db.createObjectStore('highlights', { keyPath: 'id' })
        highlightStore.createIndex('user_book_id', 'user_book_id')
        highlightStore.createIndex('highlighted_at', 'highlighted_at')
        highlightStore.createIndex('is_favorite', 'is_favorite')
        highlightStore.createIndex('is_deleted', 'is_deleted')
      }

      // Metadata store
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' })
      }
    },
  })

  return dbInstance
}

// Books
export async function saveBooks(books: Book[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('books', 'readwrite')
  await Promise.all(books.map((book) => tx.store.put(book)))
  await tx.done
}

export async function getBook(bookId: number): Promise<Book | undefined> {
  const db = await getDB()
  return db.get('books', bookId)
}

export async function getAllBooks(): Promise<Book[]> {
  const db = await getDB()
  return db.getAll('books')
}

// Highlights
export async function saveHighlights(highlights: Highlight[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('highlights', 'readwrite')
  await Promise.all(highlights.map((highlight) => tx.store.put(highlight)))
  await tx.done
}

export async function getHighlight(id: number): Promise<Highlight | undefined> {
  const db = await getDB()
  return db.get('highlights', id)
}

export async function getAllHighlights(): Promise<Highlight[]> {
  const db = await getDB()
  return db.getAll('highlights')
}

export async function getHighlightsByBook(bookId: number): Promise<Highlight[]> {
  const db = await getDB()
  return db.getAllFromIndex('highlights', 'user_book_id', bookId)
}

export async function getFavoriteHighlights(): Promise<Highlight[]> {
  const db = await getDB()
  return db.getAllFromIndex('highlights', 'is_favorite', 1)
}

export async function toggleFavorite(highlightId: number): Promise<void> {
  const db = await getDB()
  const highlight = await db.get('highlights', highlightId)
  if (highlight) {
    highlight.is_favorite = !highlight.is_favorite
    await db.put('highlights', highlight)
  }
}

// Metadata
export async function setMetadata(key: string, value: string | number | ImportProgress): Promise<void> {
  const db = await getDB()
  await db.put('metadata', { key, value })
}

export async function getMetadata(key: string): Promise<string | number | ImportProgress | undefined> {
  const db = await getDB()
  const result = await db.get('metadata', key)
  return result?.value
}

export async function getImportProgress(): Promise<ImportProgress | undefined> {
  const result = await getMetadata('importProgress')
  return result as ImportProgress | undefined
}

export async function setImportProgress(progress: ImportProgress): Promise<void> {
  await setMetadata('importProgress', progress)
}

// Clear all data
export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await db.clear('books')
  await db.clear('highlights')
  await db.clear('metadata')
}

// Export for testing
export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

