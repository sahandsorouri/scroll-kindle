// Readwise Auth Validation Route
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const READWISE_AUTH_URL = 'https://readwise.io/api/v2/auth/'

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Token ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Forward to Readwise API
    const response = await fetch(READWISE_AUTH_URL, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    })

    if (response.status === 204) {
      return NextResponse.json({ ok: true })
    }

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { error: 'Invalid Readwise token' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: response.status }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Network error connecting to Readwise' },
      { status: 500 }
    )
  }
}

