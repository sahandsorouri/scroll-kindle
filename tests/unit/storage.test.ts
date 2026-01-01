import { describe, it, expect, beforeEach } from 'vitest'
import { saveToken, getToken, clearToken, shouldRememberToken } from '@/lib/storage'

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

const sessionStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
})

describe('Storage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    sessionStorageMock.clear()
  })

  describe('saveToken', () => {
    it('should save token to localStorage when remember is true', () => {
      saveToken('test-token', true)

      expect(localStorage.getItem('readwise_token')).toBe('test-token')
      expect(localStorage.getItem('remember_token')).toBe('true')
    })

    it('should save token to sessionStorage when remember is false', () => {
      saveToken('test-token', false)

      expect(sessionStorage.getItem('readwise_token')).toBe('test-token')
      expect(localStorage.getItem('remember_token')).toBe('false')
    })
  })

  describe('getToken', () => {
    it('should retrieve token from localStorage first', () => {
      localStorage.setItem('readwise_token', 'local-token')
      sessionStorage.setItem('readwise_token', 'session-token')

      expect(getToken()).toBe('local-token')
    })

    it('should retrieve token from sessionStorage if not in localStorage', () => {
      sessionStorage.setItem('readwise_token', 'session-token')

      expect(getToken()).toBe('session-token')
    })

    it('should return null if no token exists', () => {
      expect(getToken()).toBeNull()
    })
  })

  describe('clearToken', () => {
    it('should clear token from both storages', () => {
      localStorage.setItem('readwise_token', 'token')
      localStorage.setItem('remember_token', 'true')
      sessionStorage.setItem('readwise_token', 'token')

      clearToken()

      expect(localStorage.getItem('readwise_token')).toBeNull()
      expect(localStorage.getItem('remember_token')).toBeNull()
      expect(sessionStorage.getItem('readwise_token')).toBeNull()
    })
  })

  describe('shouldRememberToken', () => {
    it('should return true by default', () => {
      expect(shouldRememberToken()).toBe(true)
    })

    it('should return false if explicitly set to false', () => {
      localStorage.setItem('remember_token', 'false')

      expect(shouldRememberToken()).toBe(false)
    })

    it('should return true if set to true', () => {
      localStorage.setItem('remember_token', 'true')

      expect(shouldRememberToken()).toBe(true)
    })
  })
})

