'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/app/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md sm:max-w-lg shadow-2xl">
        <div className="p-6 sm:p-8 md:p-10">
          {/* Company Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img
              src="/images/company.png"
              alt="CityRome Tickets"
              className="h-12 sm:h-16 object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-2">
            Admin Panel
          </h1>
          <p className="text-center text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
            Sign in to manage your tours and bookings
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 sm:h-11 border-border focus:border-primary focus:ring-primary text-sm"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 sm:h-11 border-border focus:border-primary focus:ring-primary pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 sm:h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm sm:text-base"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-secondary rounded-lg border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground">
              Email: <span className="font-mono text-foreground text-[11px] sm:text-xs">admin@example.com</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Password: <span className="font-mono text-foreground text-[11px] sm:text-xs">password123</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
