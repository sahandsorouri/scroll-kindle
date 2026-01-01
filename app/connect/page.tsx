'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { validateToken } from '@/lib/api-client'
import { saveToken } from '@/lib/storage'
import { ImportManager } from '@/lib/import-manager'
import type { ImportProgress } from '@/types/readwise'

export default function ConnectPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [remember, setRemember] = useState(true)
  const [isValidating, setIsValidating] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationSuccess, setValidationSuccess] = useState(false)
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)

  const handleValidate = async () => {
    if (!token.trim()) {
      setError('Please enter a token')
      return
    }

    setIsValidating(true)
    setError(null)
    setValidationSuccess(false)

    const result = await validateToken(token.trim())

    setIsValidating(false)

    if (result.ok) {
      setValidationSuccess(true)
    } else {
      setError(result.error || 'Validation failed')
    }
  }

  const handleConnect = async () => {
    if (!token.trim()) {
      setError('Please enter a token')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      console.log('Starting connection...')
      
      // Validate first
      const result = await validateToken(token.trim())
      console.log('Validation result:', result)

      if (!result.ok) {
        setError(result.error || 'Invalid token')
        setIsConnecting(false)
        return
      }

      // Save token locally
      saveToken(token.trim(), remember)
      console.log('Token saved locally')

      // Start import
      const importManager = new ImportManager({
        onProgress: (progress) => {
          console.log('Import progress:', progress)
          setImportProgress(progress)
        },
        onComplete: () => {
          console.log('First page loaded, navigating to feed...')
          // Navigate to feed after first page is loaded
          router.push('/feed')
        },
        onError: (errorMsg) => {
          console.error('Import error:', errorMsg)
          setError(errorMsg)
          setIsConnecting(false)
        },
      })

      console.log('Starting import...')
      // Start import - will navigate after first page loads
      await importManager.startImport(token.trim())
      console.log('Import completed (all pages)')
    } catch (err) {
      console.error('Connection error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect. Please try again.'
      setError(errorMessage)
      setIsConnecting(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← Back to home
        </Link>

        <h1 className="mb-2 text-4xl font-bold">Connect Readwise</h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Enter your Readwise access token to sync your highlights
        </p>

        <div className="mb-6">
          <label
            htmlFor="token"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Access Token
          </label>
          <input
            type="password"
            id="token"
            value={token}
            onChange={(e) => {
              setToken(e.target.value)
              setValidationSuccess(false)
              setError(null)
            }}
            placeholder="Paste your Readwise token here"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-400 dark:focus:ring-gray-400"
            disabled={isConnecting}
          />
          <p className="mt-2 text-xs text-gray-500">
            Get your token from{' '}
            <span className="font-mono">readwise.io/access_token</span>
          </p>
        </div>

        <div className="mb-6">
          <label className="flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              disabled={isConnecting}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Remember token on this device
            </span>
          </label>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {validationSuccess && (
          <div className="mb-4 rounded-lg bg-green-100 p-4 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
            ✓ Token is valid
          </div>
        )}

        {importProgress && (
          <div className="mb-4 rounded-lg bg-blue-100 p-4 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <p>
              Importing... {importProgress.totalHighlights} highlights from{' '}
              {importProgress.totalBooks} books
            </p>
            {importProgress.nextPageCursor && (
              <p className="mt-1 text-xs">Fetching more pages...</p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleValidate}
            disabled={!token.trim() || isValidating || isConnecting}
            className="flex-1 rounded-lg border-2 border-gray-800 px-4 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-100 dark:text-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900"
          >
            {isValidating ? 'Validating...' : 'Validate Token'}
          </button>

          <button
            onClick={handleConnect}
            disabled={!token.trim() || isConnecting}
            className="flex-1 rounded-lg bg-gray-800 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            {isConnecting ? 'Connecting...' : 'Connect & Import'}
          </button>
        </div>

        <div className="mt-8 rounded-lg bg-gray-100 p-4 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-400">
          <p className="font-semibold">🔒 Privacy Note</p>
          <p className="mt-2">
            Your token is stored locally on your device only. We never send it to
            our servers. All API calls are proxied through our server to avoid
            CORS, but the token is not logged or stored.
          </p>
        </div>
      </div>
    </main>
  )
}

