'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Clock, Loader2, AlertCircle } from 'lucide-react'
import { getTourPlanDetail, TourPlan } from '@/app/lib/api'
import { getCookie } from '@/app/lib/cookies'
import { LocationModal } from '@/components/dashboard/location-modal'
import { DateModal } from '@/components/dashboard/date-modal'

export default function TourDetailsPage() {
  const params = useParams()
  const tourId = params.id as string

  const [tour, setTour] = useState<TourPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [dateModalOpen, setDateModalOpen] = useState(false)
  const [locationMode, setLocationMode] = useState<'create' | 'edit'>('create')

  useEffect(() => {
    const fetchTourDetail = async () => {
      try {
        setIsLoading(true)
        const token = getCookie('access_token')
        if (token && tourId) {
          const data = await getTourPlanDetail(token, tourId)
          setTour(data)
        } else if (!token) {
          setError('Authentication token not found. Please log in again.')
        }
      } catch (err) {
        setError('Failed to fetch tour details. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTourDetail()
  }, [tourId])

  const handlePrevImage = () => {
    if (!tour?.images.length) return
    setCurrentImageIndex((prev) => (prev === 0 ? tour.images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    if (!tour?.images.length) return
    setCurrentImageIndex((prev) => (prev === tour.images.length - 1 ? 0 : prev + 1))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Card className="p-8 max-w-md border-border">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{error || "Tour not found"}</h2>
          <Link href="/dashboard/tours">
            <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              Back to Tours
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <Link href="/dashboard/tours">
            <Button variant="outline" size="icon" className="border-border bg-transparent flex-shrink-0">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">{tour.title}</h1>
            <p className="text-muted-foreground text-sm sm:text-base line-clamp-2 md:line-clamp-none">{tour.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Image & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image Carousel */}
          <Card className="border-border overflow-hidden shadow-md">
            <div className="relative bg-secondary h-64 sm:h-72">
              <img
                src={tour.images[currentImageIndex]?.file || "/placeholder.svg"}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
              {tour.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                {tour.images.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
                      }`}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Price & Duration Card */}
          <Card className="p-6 border-border shadow-md space-y-4">
            <div>
              <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider mb-1">Starting From</p>
              <p className="text-4xl font-bold text-primary">${tour.price_adult}</p>
            </div>
            {tour.duration_days && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Clock className="text-muted-foreground" size={20} />
                <span className="text-foreground font-medium">{tour.duration_days} Days</span>
              </div>
            )}
            <div className={`flex items-center gap-2 ${!tour.duration_days ? 'pt-2 border-t border-border' : ''}`}>
              <Badge variant={tour.is_active ? "default" : "secondary"}>
                {tour.status}
              </Badge>
              {tour.free_cancellation && (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  Free Cancellation
                </Badge>
              )}
              {tour.pickup_included && (
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                  Pickup Included
                </Badge>
              )}
            </div>
          </Card>
          {/* Actions */}
          <div className="p-4 border-t border-border flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-border text-primary hover:bg-primary/10 bg-transparent h-10"
            >
              <Edit size={18} />
              Edit
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-border text-destructive hover:bg-destructive/10 bg-transparent h-10"
            >
              <Trash2 size={18} />
              Delete
            </Button>
          </div>
        </div>

        {/* Right Column - Comprehensive Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Section */}
          <Card className="p-6 border-border shadow-md space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Overview</h2>

            {tour.full_description && (
              <div className="prose prose-sm max-w-none text-muted-foreground wrap-break-word">
                <p className="whitespace-pre-line">{tour.full_description}</p>
              </div>
            )}

            {tour.highlights && tour.highlights.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground">Highlights</h3>
                <ul className="grid grid-cols-1 md:grid-cols-1 gap-2">
                  {tour.highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Locations Section - RESTORED */}
          <Card className="p-6 border-border shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Locations</h2>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                onClick={() => {
                  setLocationMode('create')
                  setLocationModalOpen(true)
                }}
              >
                <Plus size={16} />
                Add New Location
              </Button>
            </div>

            {tour.locations.length > 0 ? (
              <div className="space-y-2 mb-4">
                {tour.locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between bg-secondary p-3 rounded-lg border border-border"
                  >
                    <div>
                      <Badge className="bg-primary text-primary-foreground mb-1">
                        {location.name}
                      </Badge>
                      {location.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {location.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No locations added yet
              </p>
            )}

            <Button
              variant="outline"
              className="w-full border-border text-primary hover:bg-primary/10 bg-transparent"
              onClick={() => {
                setLocationMode('edit')
                setLocationModalOpen(true)
              }}
            >
              Edit Locations
            </Button>
          </Card>

          {/* Inclusions & Exclusions */}
          <Card className="p-6 border-border shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Includes</h3>
                {tour.includes.length > 0 ? (
                  <ul className="space-y-2">
                    {tour.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-green-500 flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">None</p>
                )}
              </div>
              <div className="pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Excludes</h3>
                {tour.excludes.length > 0 ? (
                  <ul className="space-y-2">
                    {tour.excludes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-destructive flex-shrink-0">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">None</p>
                )}
              </div>
            </div>
          </Card>

          {/* Important Information */}
          <Card className="p-6 border-border shadow-md space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Important Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Know Before You Go</h3>
                  {tour.know_before_you_go.length > 0 ? (
                    <ul className="space-y-3">
                      {tour.know_before_you_go.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground pb-2 border-b border-border/50 last:border-0 flex items-start gap-2">
                          <span className="text-destructive flex-shrink-0">{i + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No specific info</p>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Not Allowed</h3>
                  {tour.not_allowed.length > 0 ? (
                    <ul className="space-y-2">
                      {tour.not_allowed.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-destructive flex-shrink-0">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No restrictions</p>
                  )}
                </div>
                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Not Suitable For</h3>
                  {tour.not_suitable_for.length > 0 ? (
                    <ul className="space-y-2">
                      {tour.not_suitable_for.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-destructive flex-shrink-0">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No specifics</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Dates & Tickets Section - RESTORED */}
          <Card className="p-6 border-border shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Date & Tickets</h2>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                onClick={() => setDateModalOpen(true)}
              >
                <Plus size={16} />
                Add New Date
              </Button>
            </div>

            {(tour as any).dates && (tour as any).dates.length > 0 ? (
              <div className="space-y-2 mb-4">
                {(tour as any).dates.map((date: any) => (
                  <div
                    key={date.id}
                    className="flex items-center justify-between bg-secondary p-3 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                  >
                    <Link href={`/dashboard/tours/${tour.id}/dates/${date.id}`}>
                      <Badge className="bg-primary text-primary-foreground">
                        {new Date(date.date).toLocaleDateString()}
                      </Badge>
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {date.times.length} time slot{date.times.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No dates scheduled yet
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Modals placeholders */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSave={() => setLocationModalOpen(false)}
        initialLocations={tour.locations.map(loc => ({
          ...loc,
          id: loc.id.toString()
        }))}
        mode={locationMode}
      />

      <DateModal
        isOpen={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        onSave={() => setDateModalOpen(false)}
        initialDates={((tour as any).dates || []).map((d: any) => ({
          ...d,
          id: d.id.toString()
        }))}
      />
    </div>
  )
}
