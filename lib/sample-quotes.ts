// Sample quotes to enrich the feed when there aren't many highlights
import type { Highlight } from '@/types/readwise'

interface BookQuote {
  text: string
  author: string
  bookTitle: string
}

// Famous quotes from various books
const SAMPLE_QUOTES: BookQuote[] = [
  {
    text: "It is only with the heart that one can see rightly; what is essential is invisible to the eye.",
    author: "Antoine de Saint-Exupéry",
    bookTitle: "The Little Prince"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    bookTitle: "Steve Jobs by Walter Isaacson"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    bookTitle: "Oscar Wilde's Wit and Wisdom"
  },
  {
    text: "In the midst of winter, I found there was, within me, an invincible summer.",
    author: "Albert Camus",
    bookTitle: "Return to Tipasa"
  },
  {
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu",
    bookTitle: "Tao Te Ching"
  },
  {
    text: "What we think, we become.",
    author: "Buddha",
    bookTitle: "Dhammapada"
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    bookTitle: "Beautiful Boy (Darling Boy)"
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Marcus Aurelius",
    bookTitle: "Meditations"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    bookTitle: "Ancient Wisdom"
  },
  {
    text: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama",
    bookTitle: "The Art of Happiness"
  },
]

// Generate sample highlights that are clearly marked as not user highlights
export function generateSampleHighlights(
  existingHighlights: Highlight[],
  targetCount: number = 50
): Highlight[] {
  // If user already has enough highlights, don't add samples
  if (existingHighlights.length >= targetCount) {
    return []
  }

  const sampleHighlights: Highlight[] = []
  const now = new Date().toISOString()
  
  // How many samples to add (up to targetCount)
  const samplesToAdd = Math.min(
    SAMPLE_QUOTES.length,
    targetCount - existingHighlights.length
  )

  for (let i = 0; i < samplesToAdd; i++) {
    const quote = SAMPLE_QUOTES[i]
    
    // Use negative IDs to distinguish from real highlights
    // and ensure they don't conflict
    sampleHighlights.push({
      id: -(i + 1), // Negative IDs for samples
      user_book_id: -(i + 1), // Negative book IDs too
      text: quote.text,
      note: `📚 Sample quote from "${quote.bookTitle}" by ${quote.author}. This is not your highlight - connect your Readwise account to see your own highlights!`,
      location: 0,
      location_type: 'page',
      highlighted_at: now,
      created_at: now,
      updated: now,
      tags: ['sample', 'inspiration'],
      is_favorite: false,
      is_deleted: false,
    })
  }

  return sampleHighlights
}

// Check if a highlight is a sample (has negative ID)
export function isSampleHighlight(highlight: Highlight): boolean {
  return highlight.id < 0
}

