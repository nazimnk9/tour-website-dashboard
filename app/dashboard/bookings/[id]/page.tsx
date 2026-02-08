'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Loader2, AlertCircle, Calendar, Clock, Users, Euro, Mail, User } from 'lucide-react'
import { getBookingById, Booking, TourTime } from '@/app/lib/api'
import { useAuth } from '@/app/contexts/auth-context'

export default function BookingDetailsPage() {
  const params = useParams()
  const { token } = useAuth()
  const bookingId = params.id as string
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!token || !bookingId) return
      try {
        setLoading(true)
        const data = await getBookingById(token, bookingId)
        setBooking(data)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching booking detail:', err)
        setError(err.message || 'Failed to fetch booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [token, bookingId])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-foreground">{error || 'Booking not found'}</p>
        <Link href="/dashboard/bookings">
          <Button>Back to Bookings</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bookings">
          <Button variant="outline" size="icon" className="border-border bg-transparent hover:bg-secondary">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">Booking Details</h1>
          <p className="text-muted-foreground text-sm">Booking ID: #{booking.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card className="p-6 border-border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Booking Status</h2>
                <p className="text-sm text-muted-foreground">Current state of this reservation</p>
              </div>
              <Badge className={`${getStatusColor(booking.status)} text-sm px-4 py-1 capitalize font-medium border-none shadow-none`}>
                {booking.status}
              </Badge>
            </div>
            {booking.cancelled_reason && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-sm font-semibold text-red-800">Cancellation Reason:</p>
                <p className="text-sm text-red-700">{booking.cancelled_reason}</p>
              </div>
            )}
          </Card>

          {/* Items / Tour Info */}
          <Card className="p-6 border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6">Reserved Items</h2>
            <div className="space-y-6">
              {booking.items.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No items in this booking.</p>
              ) : (
                booking.items.map((item, index) => {
                  const timeSlot = typeof item.time_slot === 'object' ? item.time_slot as TourTime : null;
                  return (
                    <div key={item.id} className={`${index !== 0 ? 'border-t border-border pt-6' : ''}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-semibold">Date</p>
                              <p className="font-medium text-foreground">
                                {timeSlot?.tour_date?.date ? new Date(timeSlot.tour_date.date).toLocaleDateString('en-GB', {
                                  weekday: 'long',
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                }) : 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <Clock size={18} />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-semibold">Time</p>
                              <p className="font-medium text-foreground">
                                {timeSlot?.start_time ? `${timeSlot.start_time}${timeSlot.end_time ? ` - ${timeSlot.end_time}` : ''}` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <Users size={18} />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-semibold">Guests</p>
                              <div className="text-sm font-medium text-foreground space-y-1">
                                {item.num_adults > 0 && <p>Adults: {item.num_adults}</p>}
                                {item.num_children > 0 && <p>Children: {item.num_children}</p>}
                                {item.num_infants > 0 && <p>Infants: {item.num_infants}</p>}
                                {item.num_youth > 0 && <p>Youth: {item.num_youth}</p>}
                                {item.num_student_eu > 0 && <p>Student EU: {item.num_student_eu}</p>}
                                {item.num_adults === 0 && item.num_children === 0 && item.num_infants === 0 && item.num_youth === 0 && item.num_student_eu === 0 && (
                                  <p>N/A</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg text-green-600">
                              <Euro size={18} />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-semibold">Item Price</p>
                              <p className="font-bold text-foreground">€{parseFloat(item.item_price).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>

          {/* Traveler Details */}
          <Card className="p-6 border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6">Traveler Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booking.traveler_details.map((traveler, index) => (
                <div key={index} className="p-4 bg-secondary/30 rounded-lg border border-border flex items-start gap-3">
                  <div className="p-2 bg-background rounded-full text-muted-foreground">
                    <User size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-foreground text-sm truncate">{traveler.name}</p>
                    {traveler.email && (
                      <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                        <Mail size={12} />
                        <p className="text-xs truncate">{traveler.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {booking.traveler_details.length === 0 && (
                <p className="text-muted-foreground text-sm col-span-2 text-center py-4">No traveler details provided.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border-border shadow-sm sticky top-24">
            <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground text-sm">User Type</span>
                <span className="font-medium text-foreground capitalize text-sm">{booking.user_type}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground text-sm">Created At</span>
                <span className="font-medium text-foreground text-sm">
                  {new Date(booking.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground text-sm">Last Updated</span>
                <span className="font-medium text-foreground text-sm">
                  {new Date(booking.updated_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-foreground">Total Price</span>
                  <span className="text-2xl font-bold text-primary">€{parseFloat(booking.total_price).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button asChild className="w-full">
                <Link href="/dashboard/bookings">
                  Back to All Bookings
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
