'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/auth-context'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar when clicking outside on mobile
  const handleBackdropClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Topbar - Fixed at top, full width */}
      <div className="fixed top-0 left-0 right-0 h-16 z-40">
        <Topbar 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobile={isMobile}
        />
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-20 top-16"
          onClick={handleBackdropClick}
        />
      )}

      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <div
        className={`fixed top-16 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out ${
          isMobile
            ? isSidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : 'translate-x-0'
        }`}
      >
        <Sidebar 
          isMobile={isMobile} 
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* Main Content - Responsive margin based on sidebar visibility */}
      <main
        className={`flex-1 pt-16 transition-all duration-300 ${
          !isMobile ? (isSidebarCollapsed ? 'ml-20' : 'ml-64') : ''
        }`}
      >
        <div className="p-4 sm:p-6 md:p-8 min-h-full w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
