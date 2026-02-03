'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Edit } from 'lucide-react'
import { mockBookings } from '@/app/lib/mock-data'

export default function BookingDetailsPage() {
  const params = useParams()
  const bookingId = params.id as string
  const booking = mockBookings.find((b) => b.id === bookingId)

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center border-border">
          <p className="text-muted-foreground mb-4">Booking not found</p>
          <Link href="/dashboard/bookings">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Back to Bookings
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bookings">
          <Button variant="outline" size="icon" className="border-border bg-transparent">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Booking Details</h1>
          <p className="text-muted-foreground">ID: {booking.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Info Card */}
          <Card className="p-6 border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Booking Information</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tour Name</p>
                  <p className="text-lg font-semibold text-foreground">{booking.tourName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Booking Date</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Time</p>
                  <p className="text-lg font-semibold text-foreground">{booking.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Number of Guests</p>
                  <p className="text-lg font-semibold text-foreground">{booking.quantity}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge className={getStatusColor(booking.status)} variant="outline">
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Customer Info Card */}
          <Card className="p-6 border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Customer Information</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                <p className="text-lg font-semibold text-foreground">{booking.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Created At</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Date(booking.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 border-border sticky top-24">
            <h3 className="text-lg font-semibold text-foreground mb-4">Actions</h3>

            <div className="space-y-2">
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Edit Booking
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
