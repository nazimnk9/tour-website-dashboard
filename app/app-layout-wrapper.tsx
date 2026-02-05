'use client'

import { AuthProvider } from '@/app/contexts/auth-context'
import { Provider } from 'react-redux'
import { store } from '@/app/lib/redux/store'
import { ReactNode } from 'react'

export function AppLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  )
}
