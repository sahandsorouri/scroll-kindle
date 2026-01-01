// Readwise Export Route
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const READWISE_EXPORT_URL = 'https://readwise.io/api/v2/export/'

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Token ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams
    const pageCursor = searchParams.get('pageCursor')
    const updatedAfter = searchParams.get('updatedAfter')
    const ids = searchParams.get('ids')
    const includeDeleted = searchParams.get('includeDeleted')

    // Build Readwise API URL with query params
    const readwiseUrl = new URL(READWISE_EXPORT_URL)
    if (pageCursor) readwiseUrl.searchParams.set('pageCursor', pageCursor)
    if (updatedAfter) readwiseUrl.searchParams.set('updatedAfter', updatedAfter)
    if (ids) readwiseUrl.searchParams.set('ids', ids)
    if (includeDeleted) readwiseUrl.searchParams.set('includeDeleted', includeDeleted)

    // Forward to Readwise API
    const response = await fetch(readwiseUrl.toString(), {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    })

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { error: 'Invalid Readwise token' },
        { status: 401 }
      )
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after')
      return NextResponse.json(
        { error: `Rate limited. Retry after ${retryAfter || 60} seconds.` },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter || '60',
          },
        }
      )
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Readwise export error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch highlights from Readwise' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Network error connecting to Readwise' },
      { status: 500 }
    )
  }
}

