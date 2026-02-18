import { User } from '@supabase/supabase-js'
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

interface UserContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
  authFetch: (url: string, options?: FetchOptions) => Promise<Response>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for token on mount
    const savedToken = localStorage.getItem('promote-sh-token')
    const savedUser = localStorage.getItem('promote-sh-user')

    if (savedToken) {
      setToken(savedToken)
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          console.error('Failed to parse saved user', e)
        }
      }
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('promote-sh-token', newToken)
    localStorage.setItem('promote-sh-user', JSON.stringify(newUser))
  }

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('promote-sh-token')
    localStorage.removeItem('promote-sh-user')
  }, [])

  // Authenticated fetch that auto-logs out on 401
  const authFetch = useCallback(async (url: string, options: FetchOptions = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Auto-logout on 401 Unauthorized
    if (response.status === 401) {
      console.warn('Session expired or unauthorized. Logging out...')
      logout()
    }

    return response
  }, [token, logout])

  const value = useMemo(() => ({
    user,
    token,
    login,
    logout,
    isLoading,
    authFetch,
  }), [user, token, isLoading, authFetch, logout])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
