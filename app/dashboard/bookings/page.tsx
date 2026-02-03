'use client'

import { useState, useMemo } from 'react'
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
import { Eye, Plus } from 'lucide-react'
import { mockBookings } from '@/app/lib/mock-data'
import { StatusModal } from '@/components/dashboard/status-modal'

const ITEMS_PER_PAGE = 10

export default function BookingsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  const totalPages = Math.ceil(mockBookings.length / ITEMS_PER_PAGE)
  const paginatedBookings = mockBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const selectedBooking = mockBookings.find((b) => b.id === selectedBookingId)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    // Handle status update
    console.log(`Booking ${bookingId} status changed to ${newStatus}`)
    setStatusModalOpen(false)
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Bookings</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage tour bookings and reservations</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 whitespace-nowrap text-sm sm:text-base px-4 py-2 h-10 sm:h-11 rounded-lg">
          <Plus size={20} />
          Add New Booking
        </Button>
      </div>

      {/* Bookings Table - Responsive */}
      <Card className="border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-secondary hover:bg-secondary">
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">ID</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Tour</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Date</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Time</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Status</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Created</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBookings.map((booking) => (
                <TableRow key={booking.id} className="border-border hover:bg-secondary/50 transition-colors">
                  <TableCell className="font-medium text-foreground text-xs sm:text-sm truncate">{booking.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm truncate">{booking.tourName}</TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm">
                    {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm">{booking.time}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(booking.status)} text-xs sm:text-sm`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm">
                    {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
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
                className={`text-sm h-10 w-10 p-0 rounded-lg ${
                  currentPage === i + 1
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
      )}

      {/* Status Modal */}
      {selectedBooking && (
        <StatusModal
          isOpen={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false)
            setSelectedBookingId(null)
          }}
          onSave={(newStatus) => handleStatusChange(selectedBookingId!, newStatus)}
          currentStatus={selectedBooking.status}
          statusOptions={['pending', 'confirmed', 'cancelled']}
        />
      )}
    </div>
  )
}
