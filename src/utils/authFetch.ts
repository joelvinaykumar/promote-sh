// Utility for making authenticated API calls with auto-logout on 401

type FetchOptions = RequestInit & {
  token?: string | null
}

export const createAuthFetch = (logout: () => void) => {
  return async (url: string, options: FetchOptions = {}) => {
    const { token, ...fetchOptions } = options

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    // Auto-logout on 401 Unauthorized
    if (response.status === 401) {
      console.warn('Session expired or unauthorized. Logging out...')
      logout()
      throw new Error('Unauthorized')
    }

    return response
  }
}
