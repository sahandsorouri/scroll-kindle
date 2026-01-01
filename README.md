# QuoteScroll

> Scroll your own highlights instead of doomscrolling.

QuoteScroll transforms your Readwise highlights into a TikTok-style vertical feed. Rediscover your favorite quotes with every scroll.

## Features

- 🎯 **TikTok-style vertical feed** - Full-screen highlight cards with smooth navigation
- ⌨️ **Multi-input support** - Mouse wheel, keyboard (arrows/j/k), and touch gestures
- 📚 **Book profiles** - Browse your library and filter highlights by book
- 🔍 **Search & Filters** - Find highlights by keyword, book, or favorites
- ⭐ **Local favorites** - Mark highlights as favorites (stored locally)
- 📋 **Copy to clipboard** - Copy highlights as plain text or formatted quotes
- 🎨 **Demo mode** - Try the app without connecting your Readwise account
- 🔒 **Privacy-first** - Token stored locally, no server-side storage
- 📱 **Fully responsive** - Works beautifully on desktop and mobile

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB (via `idb`) for highlights, localStorage for token
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **API Mocking**: MSW
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- (Optional) A Readwise account with highlights

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/quotescroll.git
cd quotescroll

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Demo Mode

1. Click "Try Demo" on the landing page
2. Explore the feed with demo highlights
3. Test all features without needing a Readwise account

### Connecting Your Readwise Account

1. Get your Readwise access token from [readwise.io/access_token](https://readwise.io/access_token)
2. Click "Connect Readwise" on the landing page
3. Paste your token
4. Click "Validate Token" to verify it works
5. Click "Connect & Import" to start importing your highlights
6. Wait for the first page to load (subsequent pages load in the background)

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server (localhost:3000)

# Building
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting
pnpm type-check       # Run TypeScript type checking

# Testing
pnpm test             # Run unit tests with Vitest
pnpm test:ui          # Run Vitest with UI
pnpm test:e2e         # Run E2E tests with Playwright
pnpm test:e2e:ui      # Run Playwright with UI
```

### Project Structure

```
quotescroll/
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Landing page
│   ├── connect/               # Token connection page
│   ├── feed/                  # Main highlight feed
│   ├── books/                 # Books list and detail pages
│   └── api/readwise/          # API proxy routes
├── lib/                        # Core library code
│   ├── db.ts                  # IndexedDB persistence layer
│   ├── storage.ts             # localStorage wrapper (token)
│   ├── normalize.ts           # Data normalization utilities
│   ├── api-client.ts          # Client-side API wrapper
│   ├── import-manager.ts      # Import orchestration
│   └── demo-data.ts           # Demo mode fixtures
├── types/                      # TypeScript type definitions
│   └── readwise.ts            # Readwise API types
├── tests/                      # Test files
│   ├── unit/                  # Unit tests (Vitest)
│   ├── e2e/                   # E2E tests (Playwright)
│   └── fixtures/              # Test data
└── ...config files
```

## API Routes

The app includes server-side proxy routes to avoid CORS and protect your token:

### `POST /api/readwise/auth`

Validates a Readwise token.

**Request Headers:**
- `Authorization: Token <YOUR_TOKEN>`

**Response:**
```json
{ "ok": true }
```

### `GET /api/readwise/export`

Fetches highlights from Readwise.

**Request Headers:**
- `Authorization: Token <YOUR_TOKEN>`

**Query Parameters:**
- `pageCursor` (string, optional) - Pagination cursor
- `updatedAfter` (ISO 8601, optional) - Filter by update time
- `ids` (comma-separated, optional) - Filter by book IDs
- `includeDeleted` (boolean, optional) - Include deleted highlights

**Response:**
```json
{
  "count": 100,
  "nextPageCursor": "cursor_string_or_null",
  "results": [
    {
      "user_book_id": 123,
      "title": "Book Title",
      "author": "Author Name",
      "highlights": [
        {
          "id": 456,
          "text": "Highlight text...",
          "note": "Optional note",
          "highlighted_at": "2024-12-15T10:30:00Z",
          ...
        }
      ]
    }
  ]
}
```

## Testing

### Unit Tests

Unit tests cover core utilities and data transformations:

```bash
pnpm test
```

Key test files:
- `tests/unit/normalize.test.ts` - Data normalization
- `tests/unit/storage.test.ts` - Token storage
- `tests/unit/import-manager.test.ts` - Filtering and sorting

### E2E Tests

End-to-end tests cover user flows:

```bash
pnpm test:e2e
```

Key test files:
- `tests/e2e/landing.spec.ts` - Landing page
- `tests/e2e/demo-mode.spec.ts` - Demo mode functionality
- `tests/e2e/books.spec.ts` - Books pages

The E2E tests automatically start a dev server on port 3000.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build
4. Deploy!

No environment variables or server configuration needed.

### Manual Build

```bash
pnpm build
pnpm start
```

The production build is optimized and ready to deploy on any Node.js hosting platform.

## Privacy & Security

QuoteScroll is designed with privacy as a core principle:

- ✅ **Token stored locally** - Your Readwise token is stored in localStorage/sessionStorage on your device only
- ✅ **No server-side storage** - The API proxy forwards your token but never stores it
- ✅ **No logging** - Your token is not logged on the server
- ✅ **Client-side data** - All highlights are stored in IndexedDB on your device
- ✅ **Private by default** - No public sharing or public pages
- ✅ **No analytics** - No tracking or analytics by default

### How the API Proxy Works

1. Your browser sends requests to `/api/readwise/*` with your token in the `Authorization` header
2. The Next.js API route forwards the request to Readwise's API
3. Readwise responds with your data
4. The API route returns the response to your browser

The token is never stored, logged, or sent to any third party. It only exists in transit between your browser and Readwise.

## Keyboard Shortcuts

When viewing the feed:

- `↓` or `j` - Next highlight
- `↑` or `k` - Previous highlight
- Mouse wheel - Navigate highlights
- Touch swipe - Navigate on mobile

## Limitations & Known Issues

- **Import time** - Large libraries (10,000+ highlights) may take several minutes to import
- **Rate limiting** - Readwise has rate limits; the app handles 429 responses with retry logic
- **Demo mode** - Demo data is hardcoded and limited to ~15 highlights
- **Search performance** - Very large libraries (50,000+ highlights) may have slower search

## Roadmap

Potential future enhancements:

- [ ] Background sync (periodic re-import of updates)
- [ ] Export highlights as markdown/JSON
- [ ] Custom themes and color schemes
- [ ] Spaced repetition mode
- [ ] Share individual highlights (with user consent)
- [ ] Mobile app (React Native)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Tests pass (`pnpm test` and `pnpm test:e2e`)
- Code is formatted (`pnpm format`)
- No linting errors (`pnpm lint`)
- TypeScript compiles (`pnpm type-check`)

## License

MIT License - feel free to use this project however you'd like.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Data from [Readwise](https://readwise.io/)
- Inspired by the desire to rediscover personal knowledge

## Disclaimer

QuoteScroll is an unofficial tool and is not affiliated with, endorsed by, or connected to Readwise in any way. Readwise is a trademark of Readwise, Inc.

---

**Happy scrolling! 📚✨**

