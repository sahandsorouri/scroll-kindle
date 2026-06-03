# QuoteScroll

> Scroll your own book highlights instead of doomscrolling.

**Live:** [bookfeed.sorouri.com](https://bookfeed.sorouri.com)

## The Problem

We save hundreds of highlights in Readwise and never look at them again. The habit we do have is scrolling a vertical feed. So I built a feed of my own highlights.

## What I Built

A Next.js app that turns your Readwise highlights into a TikTok-style vertical feed. Connect your Readwise token, import your library, then scroll your highlights full-screen. Filter by book, search by keyword, mark favorites. There is a demo mode that works with no account.

Privacy-first by design: your token stays in your browser, highlights live in IndexedDB on your device, nothing is stored server-side.

## Key Features

- Vertical full-screen feed: wheel, keyboard (arrows, j, k), and touch
- Browse by book, search, and local favorites
- Demo mode with no account needed
- Server-side proxy so your token never hits a third party

## Stack

`Next.js 14` `TypeScript` `Tailwind CSS` `IndexedDB (idb)` `Vitest` `Playwright` `MSW` `Cloudflare Pages`

## How to Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Use Demo mode, or paste a Readwise token from [readwise.io/access_token](https://readwise.io/access_token).

## Status

Running in production at [bookfeed.sorouri.com](https://bookfeed.sorouri.com). Covered by unit tests (Vitest) and E2E tests (Playwright).

## About

Built by [Sahand Sorouri](https://github.com/sahandsorouri). Not affiliated with Readwise.
