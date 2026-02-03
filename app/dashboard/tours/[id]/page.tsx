'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from 'lucide-react'
import { mockTours } from '@/app/lib/mock-data'
import { LocationModal } from '@/components/dashboard/location-modal'
import { DateModal } from '@/components/dashboard/date-modal'

export default function TourDetailsPage() {
  const params = useParams()
  const tourId = params.id as string

  const tour = useMemo(() => mockTours.find((t) => t.id === tourId), [tourId])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [dateModalOpen, setDateModalOpen] = useState(false)
  const [locationMode, setLocationMode] = useState<'create' | 'edit'>('create')

  if (!tour) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center border-border">
          <p className="text-muted-foreground mb-4">Tour not found</p>
          <Link href="/dashboard/tours">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Back to Tours
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Sample images for carousel
  const images = [
    tour.image,
    'https://images.unsplash.com/photo-1552832860-cfb67165eaf0?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  ]

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-8">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/tours">
            <Button variant="outline" size="icon" className="border-border bg-transparent">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{tour.name}</h1>
            <p className="text-muted-foreground">{tour.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Image & Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image Carousel */}
          <Card className="border-border overflow-hidden">
            <div className="relative bg-secondary h-64">
              <img
                src={images[currentImageIndex] || "/placeholder.svg"}
                alt={tour.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
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
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Edit & Delete Buttons */}
            <div className="p-4 border-t border-border flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-border text-primary hover:bg-primary/10 bg-transparent"
              >
                <Edit size={18} />
                Edit
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border text-destructive hover:bg-destructive/10 bg-transparent"
              >
                <Trash2 size={18} />
                Delete
              </Button>
            </div>
          </Card>

          {/* Price Card */}
          <Card className="p-6 border-border">
            <p className="text-muted-foreground text-sm mb-2">Tour Price</p>
            <p className="text-4xl font-bold text-primary">${tour.price}</p>
            <p className="text-muted-foreground text-sm mt-2">Duration: {tour.duration}</p>
          </Card>
        </div>

        {/* Right Column - Locations & Dates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Locations Section */}
          <Card className="p-6 border-border">
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

          {/* Dates & Tickets Section */}
          <Card className="p-6 border-border">
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

            {tour.dates.length > 0 ? (
              <div className="space-y-2 mb-4">
                {tour.dates.map((date) => (
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

      {/* Modals */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSave={(locations) => {
          // Handle save
          setLocationModalOpen(false)
        }}
        initialLocations={tour.locations}
        mode={locationMode}
      />

      <DateModal
        isOpen={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        onSave={(dates) => {
          // Handle save
          setDateModalOpen(false)
        }}
        initialDates={tour.dates}
      />
    </div>
  )
}
