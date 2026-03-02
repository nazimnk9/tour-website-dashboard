'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, X, Loader2, AlertCircle, Calendar, Clock, Users, Euro, Mail, User } from 'lucide-react'
import { getBookingById, Booking, TourTime, TourPlan } from '@/app/lib/api'
import { useAuth } from '@/app/contexts/auth-context'

export default function BookingDetailsPage() {
  const params = useParams()
  const { token } = useAuth()
  const bookingId = params.id as string
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightboxState, setLightboxState] = useState<{ isOpen: boolean; images: any[]; currentIndex: number }>({
    isOpen: false,
    images: [],
    currentIndex: 0
  })

  const openLightbox = (images: any[], index: number) => {
    setLightboxState({ isOpen: true, images, currentIndex: index })
  }

  const closeLightbox = () => {
    setLightboxState(prev => ({ ...prev, isOpen: false }))
  }

  const prevImage = () => {
    setLightboxState(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
    }))
  }

  const nextImage = () => {
    setLightboxState(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }))
  }

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
            {booking.status === 'cancelled' && booking.cancelled_reason && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">Cancellation Reason</p>
                  <p className="text-sm text-red-700 leading-relaxed">{booking.cancelled_reason}</p>
                </div>
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
                  const tourPlan = typeof item.tour_plan === 'object' ? item.tour_plan : null;

                  return (
                    <div key={item.id} className={`${index !== 0 ? 'border-t border-border pt-8' : ''}`}>
                      {/* Tour Title & Description */}
                      {tourPlan && (
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-foreground mb-2">{tourPlan.title}</h3>
                          <p className="text-sm text-muted-foreground transition-all cursor-pointer">
                            {tourPlan.description}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Column 1: Booking Info */}
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <Users size={18} />
                            </div>
                            <div className="w-full">
                              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Guests Breakdown</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {item.num_adults > 0 && (
                                  <div className="flex justify-between p-2 bg-secondary/20 rounded">
                                    <span>Adults</span>
                                    <span className="font-bold">{item.num_adults}</span>
                                  </div>
                                )}
                                {item.num_children > 0 && (
                                  <div className="flex justify-between p-2 bg-secondary/20 rounded">
                                    <span>Children</span>
                                    <span className="font-bold">{item.num_children}</span>
                                  </div>
                                )}
                                {item.num_infants > 0 && (
                                  <div className="flex justify-between p-2 bg-secondary/20 rounded">
                                    <span>Infants</span>
                                    <span className="font-bold">{item.num_infants}</span>
                                  </div>
                                )}
                                {item.num_youth > 0 && (
                                  <div className="flex justify-between p-2 bg-secondary/20 rounded">
                                    <span>Youth</span>
                                    <span className="font-bold">{item.num_youth}</span>
                                  </div>
                                )}
                                {item.num_student_eu > 0 && (
                                  <div className="flex justify-between p-2 bg-secondary/20 rounded">
                                    <span>Student EU</span>
                                    <span className="font-bold">{item.num_student_eu}</span>
                                  </div>
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
                              <p className="text-xl font-bold text-foreground">€{parseFloat(item.item_price).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Tour Images / Features */}
                        <div className="space-y-6">
                          {tourPlan && tourPlan.images && tourPlan.images.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Tour Gallery</p>
                              <div className="grid grid-cols-3 gap-2">
                                {tourPlan.images.slice(0, 6).map((img, i) => (
                                  <div
                                    key={img.id}
                                    className="relative aspect-video rounded-md overflow-hidden bg-secondary cursor-pointer"
                                    onClick={() => openLightbox(tourPlan.images, i)}
                                  >
                                    <img
                                      src={img.file.startsWith('http') ? img.file : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, '')}${img.file}`}
                                      alt={`Tour image ${i + 1}`}
                                      className="object-fixed w-full h-full hover:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {tourPlan && (
                            <div className="grid grid-cols-2 gap-4">
                              {tourPlan.free_cancellation && (
                                <Badge variant="outline" className="justify-center border-green-200 bg-green-50 text-green-700 py-1">
                                  Free Cancellation
                                </Badge>
                              )}
                              {tourPlan.pickup_included && (
                                <Badge variant="outline" className="justify-center border-blue-200 bg-blue-50 text-blue-700 py-1">
                                  Pickup Included
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Highlights & Inclusions */}
                      {tourPlan && (
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-dashed border-border">
                          <div>
                            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                              Highlights
                            </h4>
                            <ul className="space-y-2">
                              {tourPlan.highlights.map((h, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <div className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground shrink-0"></div>
                                  {h}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Included
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {tourPlan.includes.map((inc, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <div className="mt-1.5 w-1 h-1 rounded-full bg-green-500 shrink-0"></div>
                                  {inc}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {tourPlan.excludes.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Excluded
                              </h4>
                              <ul className="space-y-2 text-sm text-muted-foreground">
                                {tourPlan.excludes.map((exc, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <div className="mt-1.5 w-1 h-1 rounded-full bg-red-500 shrink-0"></div>
                                    {exc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Locations / Itinerary */}
                      {tourPlan && tourPlan.locations && tourPlan.locations.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-dashed border-border">
                          <h4 className="font-bold text-foreground mb-4">Tour Itinerary / Locations</h4>
                          <div className="space-y-4">
                            {tourPlan.locations.map((loc, i) => (
                              <div key={loc.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                    {i + 1}
                                  </div>
                                  {i < tourPlan.locations.length - 1 && (
                                    <div className="w-0.5 h-full bg-border mt-1"></div>
                                  )}
                                </div>
                                <div className="pb-4">
                                  <p className="font-semibold text-foreground">{loc.name}</p>
                                  <p className="text-sm text-muted-foreground mt-1">{loc.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Know Before You Go & Not Allowed */}
                      {tourPlan && (
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-dashed border-border text-sm">
                          {tourPlan.know_before_you_go.length > 0 && (
                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 col-span-2">
                              <p className="font-bold text-primary mb-2">Know Before You Go</p>
                              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                {tourPlan.know_before_you_go.map((item, i) => <li key={i}>{item}</li>)}
                              </ul>
                            </div>
                          )}
                          {tourPlan.not_suitable_for.length > 0 && (
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                              <p className="font-bold text-orange-800 mb-2">Not Suitable For</p>
                              <ul className="list-disc list-inside text-orange-700 space-y-1">
                                {tourPlan.not_suitable_for.map((item, i) => <li key={i}>{item}</li>)}
                              </ul>
                            </div>
                          )}
                          {tourPlan.not_allowed.length > 0 && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                              <p className="font-bold text-red-800 mb-2">Not Allowed</p>
                              <ul className="list-disc list-inside text-red-700 space-y-1">
                                {tourPlan.not_allowed.map((item, i) => <li key={i}>{item}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </Card>

          {/* Traveler Details */}
          <Card className="p-6 border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6">Traveler Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

            <div className="mt-8 flex gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard/bookings">
                  Back to All Bookings
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href={`/dashboard/bookings/${booking.id}/edit`}>
                  Edit
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxState.isOpen && lightboxState.images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 bg-secondary/50 rounded-full text-foreground hover:bg-secondary transition-colors z-[110]"
          >
            <X size={24} />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 sm:left-6 p-3 bg-secondary/50 rounded-full text-foreground hover:bg-secondary transition-colors z-[110]"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="max-w-[90vw] max-h-[85vh] relative flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxState.images[lightboxState.currentIndex].file.startsWith('http')
                ? lightboxState.images[lightboxState.currentIndex].file
                : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, '')}${lightboxState.images[lightboxState.currentIndex].file}`
              }
              alt="Full view"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-500"
            />
            <div className="mt-4 px-4 py-2 bg-secondary/50 rounded-full text-sm font-medium text-foreground">
              {lightboxState.currentIndex + 1} / {lightboxState.images.length}
            </div>
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 sm:right-6 p-3 bg-secondary/50 rounded-full text-foreground hover:bg-secondary transition-colors z-[110]"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </div>
  )
}
