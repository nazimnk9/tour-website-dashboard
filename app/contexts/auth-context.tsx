'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { loginAdmin, ApiErrorResponse } from '@/app/lib/api'
import { setCookie, getCookie, deleteCookie } from '@/app/lib/cookies'

interface AuthContextType {
  isAuthenticated: boolean
  user: { email: string } | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string | string[] }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize auth state from cookies
  useEffect(() => {
    const checkAuth = () => {
      const accessToken = getCookie('access_token')

      if (accessToken) {
        setIsAuthenticated(true)
        setUser({ email: 'admin@example.com' }) // In a real app, decode JWT

        // If logged in and trying to access login page, redirect to dashboard
        if (pathname === '/login') {
          router.push('/dashboard')
        }
      } else {
        setIsAuthenticated(false)
        setUser(null)

        // If not logged in and not on login page, redirect to login
        if (pathname !== '/login') {
          router.push('/login')
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string | string[] }> => {
    try {
      const response = await loginAdmin({ email, password })

      // Save tokens in cookies
      setCookie('access_token', response.access, 1)
      setCookie('refresh_token', response.refresh, 7)

      setIsAuthenticated(true)
      setUser({ email })
      router.push('/dashboard')
      return { success: true }
    } catch (err) {
      const apiError = err as ApiErrorResponse
      let errorMessage: string | string[] = 'An error occurred during login'

      if (apiError.detail) {
        errorMessage = apiError.detail
      } else if (apiError.email || apiError.password) {
        const errors: string[] = []
        if (apiError.email) errors.push(...apiError.email)
        if (apiError.password) errors.push(...apiError.password)
        errorMessage = errors
      }

      return { success: false, error: errorMessage }
    }
  }, [router])

  const logout = useCallback(() => {
    deleteCookie('access_token')
    deleteCookie('refresh_token')
    setIsAuthenticated(false)
    setUser(null)
    router.push('/login')
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
