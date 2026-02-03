'use client'

import { AuthProvider } from '@/app/contexts/auth-context'
import { ReactNode } from 'react'

export function AppLayoutWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
