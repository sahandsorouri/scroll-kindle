// Client-side localStorage wrapper for token management

const TOKEN_KEY = 'readwise_token'
const REMEMBER_TOKEN_KEY = 'remember_token'

export function saveToken(token: string, remember: boolean = true): void {
  if (typeof window === 'undefined') return
  
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(REMEMBER_TOKEN_KEY, 'true')
  } else {
    // Store in sessionStorage for temporary sessions
    sessionStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(REMEMBER_TOKEN_KEY, 'false')
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  
  // Check localStorage first
  const rememberedToken = localStorage.getItem(TOKEN_KEY)
  if (rememberedToken) return rememberedToken
  
  // Check sessionStorage
  const sessionToken = sessionStorage.getItem(TOKEN_KEY)
  return sessionToken
}

export function clearToken(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REMEMBER_TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

export function shouldRememberToken(): boolean {
  if (typeof window === 'undefined') return true
  
  const remember = localStorage.getItem(REMEMBER_TOKEN_KEY)
  return remember !== 'false'
}

