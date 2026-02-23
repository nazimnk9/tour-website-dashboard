'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Plus, Loader2, AlertCircle } from 'lucide-react'
import { StatusModal } from '@/components/dashboard/status-modal'
import { getBookings, Booking } from '@/app/lib/api'
import { useAuth } from '@/app/contexts/auth-context'

const ITEMS_PER_PAGE = 20

export default function BookingsPage() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)

  const fetchBookings = async (page: number) => {
    if (!token) return
    try {
      setLoading(true)
      const response = await getBookings(token, page)
      setBookings(response.results)
      setTotalCount(response.count)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      setError(err.message || 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings(currentPage)
  }, [token, currentPage])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusChange = () => {
    fetchBookings(currentPage)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error && bookings.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Bookings</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage tour bookings and reservations</p>
        </div>
        <Link href="/dashboard/bookings/new">
          <Button className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 whitespace-nowrap text-sm sm:text-base px-4 py-2 h-10 sm:h-11 rounded-lg">
            <Plus size={20} />
            Add New Booking
          </Button>
        </Link>
      </div>

      {/* Bookings Table - Responsive */}
      <Card className="border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-secondary hover:bg-secondary">
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">ID</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">User Type</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Price</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Status</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Created At</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id} className="border-border hover:bg-secondary/50 transition-colors">
                    <TableCell className="font-medium text-foreground text-xs sm:text-sm">#{booking.id}</TableCell>
                    <TableCell className="text-muted-foreground text-xs sm:text-sm capitalize">{booking.user_type}</TableCell>
                    <TableCell className="text-muted-foreground text-xs sm:text-sm font-medium">
                      €{parseFloat(booking.total_price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(booking.status)} text-xs sm:text-sm capitalize font-normal border-none shadow-none`}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs sm:text-sm">
                      {new Date(booking.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-primary hover:bg-primary/10 bg-transparent text-xs h-8 px-2 rounded"
                          >
                            <Eye size={14} />
                            <span className="hidden sm:inline ml-1">View</span>
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border text-primary hover:bg-primary/10 bg-transparent text-xs h-8 px-2 rounded"
                          onClick={() => {
                            setSelectedBookingId(booking.id)
                            setStatusModalOpen(true)
                          }}
                        >
                          Status
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 px-2">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            Page {currentPage} of {totalPages} ({totalCount} total bookings)
          </div>
          <div className="flex items-center gap-2 overflow-x-auto order-1 sm:order-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="border-border text-sm h-10 px-4 flex-shrink-0"
            >
              Previous
            </Button>

            <div className="flex gap-1 flex-shrink-0">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`text-sm h-10 w-10 p-0 rounded-lg ${currentPage === i + 1
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border hover:bg-secondary'
                    }`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              className="border-border text-sm h-10 px-4 flex-shrink-0"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {selectedBooking && token && (
        <StatusModal
          isOpen={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false)
            setSelectedBookingId(null)
          }}
          onSave={handleStatusChange}
          currentStatus={selectedBooking.status}
          id={selectedBooking.id}
          token={token}
        />
      )}
    </div>
  )
}
