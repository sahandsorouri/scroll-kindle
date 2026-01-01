// Client-side API wrapper
import type { ReadwiseExportResponse } from '@/types/readwise'

export interface ApiError {
  error: string
  status?: number
  retryAfter?: number
}

export async function validateToken(token: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch('/api/readwise/auth', {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return data
    }

    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    return { ok: false, error: errorData.error || 'Validation failed' }
  } catch (_error) {
    return { ok: false, error: 'Network error' }
  }
}

export interface ExportOptions {
  pageCursor?: string
  updatedAfter?: string
  ids?: string
  includeDeleted?: boolean
}

export async function fetchExport(
  token: string,
  options: ExportOptions = {}
): Promise<ReadwiseExportResponse> {
  const params = new URLSearchParams()

  if (options.pageCursor) params.set('pageCursor', options.pageCursor)
  if (options.updatedAfter) params.set('updatedAfter', options.updatedAfter)
  if (options.ids) params.set('ids', options.ids)
  if (options.includeDeleted) params.set('includeDeleted', 'true')

  const url = `/api/readwise/export?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))

    if (response.status === 429 && response.headers.get('retry-after')) {
      throw {
        error: errorData.error || 'Rate limited',
        status: 429,
        retryAfter: parseInt(response.headers.get('retry-after') || '60', 10),
      } as ApiError
    }

    throw {
      error: errorData.error || 'Export failed',
      status: response.status,
    } as ApiError
  }

  return response.json()
}

