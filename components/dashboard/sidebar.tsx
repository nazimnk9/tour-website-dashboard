'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Plane,
  BookOpen,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/auth-context'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface SidebarProps {
  isMobile?: boolean
  onClose?: () => void
  isCollapsed?: boolean
}

export function Sidebar({ isMobile = false, onClose, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Tours',
      icon: Plane,
      href: '/dashboard/tours',
      active: pathname.includes('/tours'),
    },
    {
      label: 'Bookings',
      icon: BookOpen,
      href: '/dashboard/bookings',
      active: pathname.includes('/bookings'),
    },
    {
      label: 'Contact Requests',
      icon: MessageSquare,
      href: '/dashboard/contact-requests',
      active: pathname.includes('/contact-requests'),
    },
    {
      label: 'Notices',
      icon: Bell,
      href: '/dashboard/notices',
      active: pathname.includes('/notices'),
    },
  ]

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose()
    }
  }

  const handleConfirmLogout = () => {
    logout()
    if (isMobile && onClose) {
      onClose()
    }
    setShowLogoutDialog(false)
  }

  // On mobile/tablet, always show labels. On desktop, respect collapse state
  const shouldShowLabels = isMobile || !isCollapsed

  return (
    <>
      <div
        className={cn(
          'bg-sidebar text-sidebar-foreground h-full flex flex-col border-r border-sidebar-border overflow-hidden transition-all duration-300',
          isCollapsed && !isMobile ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center p-4 border-b border-sidebar-border flex-shrink-0">
          <img
            src="/images/company.png"
            alt="CityRome Tickets"
            className={cn(
              'h-10 sm:h-12 object-contain transition-all duration-300',
              isCollapsed && !isMobile ? 'h-18' : 'h-18 sm:h-22'
            )}
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {routes.map((route) => {
            const Icon = route.icon
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium',
                  isCollapsed && !isMobile ? 'justify-center p-3' : '',
                  route.active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
                title={isCollapsed && !isMobile ? route.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {shouldShowLabels && <span>{route.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section - Settings & Logout */}
        <div className="border-t border-sidebar-border p-3 space-y-2 flex-shrink-0">
          {/* Settings Link */}
          <Link
            href="/dashboard/settings"
            onClick={handleLinkClick}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium',
              isCollapsed && !isMobile ? 'justify-center p-3' : '',
              pathname.includes('/settings')
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
            title={isCollapsed && !isMobile ? 'Settings' : undefined}
          >
            <Settings size={20} className="flex-shrink-0" />
            {shouldShowLabels && <span>Settings</span>}
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutDialog(true)}
            className={cn(
              'cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-sm font-medium',
              isCollapsed && !isMobile ? 'justify-center p-3' : '',
              'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
            title={isCollapsed && !isMobile ? 'Logout' : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {shouldShowLabels && <span>Logout</span>}
          </button>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again to access the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout} className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
