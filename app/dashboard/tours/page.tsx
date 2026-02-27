'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Clock, Loader2, AlertCircle } from 'lucide-react'
import { getTourPlans, TourPlan } from '@/app/lib/api'
import { getCookie } from '@/app/lib/cookies'

const ITEMS_PER_PAGE = 6

export default function ToursPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [tours, setTours] = useState<TourPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true)
        const token = getCookie('access_token')
        if (token) {
          const response = await getTourPlans(token)
          setTours(response.results)
        } else {
          setError('Authentication token not found. Please log in again.')
        }
      } catch (err) {
        setError('Failed to fetch tours. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTours()
  }, [])

  const filteredTours = useMemo(() => {
    return tours.filter((tour) =>
      tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, tours])

  const totalPages = Math.ceil(filteredTours.length / ITEMS_PER_PAGE)
  const paginatedTours = filteredTours.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground mb-2">Tours</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage and organize all your tour offerings</p>
        </div>
        <Link href="/dashboard/tours/create">
          <Button className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 whitespace-nowrap text-sm sm:text-base px-4 py-2 h-10 sm:h-11 rounded-lg">
            <Plus size={20} />
            Add New Tours
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      {/* <Card className="p-4 sm:p-6 border-border shadow-sm">
        
      </Card> */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search tours by title or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 h-10 sm:h-11 border-border text-sm"
          />
        </div>
        <Button variant="outline" className="cursor-pointer border-border bg-transparent text-sm sm:text-base h-10 sm:h-11 hover:bg-secondary">
          Search
        </Button>
      </div>

      {/* Tours Grid - Fully responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr">
        {paginatedTours.map((tour) => (
          <Card
            key={tour.id}
            className="overflow-hidden border-border hover:shadow-lg transition-all duration-300 flex flex-col group"
          >
            {/* Tour Image */}
            <div className="relative h-40 sm:h-64 bg-secondary overflow-hidden">
              <img
                src={tour.images[0]?.file || "/placeholder.svg"}
                alt={tour.title}
                className="w-full h-full object-fixed group-hover:scale-105 transition-transform duration-300"
              />
              <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-primary text-primary-foreground text-xs sm:text-sm px-2 sm:px-3 py-1 rounded">
                ${tour.price_adult}
              </Badge>
            </div>

            {/* Tour Info */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {tour.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-4 line-clamp-3 flex-1">
                {tour.description}
              </p>

              {/* Duration */}
              {tour.duration_days && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-4">
                  <Clock size={16} className="flex-shrink-0" />
                  <span className="font-medium">{tour.duration_days} Days</span>
                </div>
              )}

              {/* Locations Badge */}
              <div className="mb-4 flex flex-wrap gap-2">
                {tour.locations.slice(0, 2).map((location) => (
                  <Badge key={location.id} variant="secondary" className="text-xs sm:text-sm px-2 py-1">
                    {location.name}
                  </Badge>
                ))}
                {tour.locations.length > 2 && (
                  <Badge variant="secondary" className="text-xs sm:text-sm px-2 py-1">
                    +{tour.locations.length - 2} more
                  </Badge>
                )}
              </div>

              {/* View Details Button */}
              <Link href={`/dashboard/tours/${tour.id}`} className="w-full">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-10 rounded-lg font-semibold cursor-pointer"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="border-border text-sm h-10 px-4 flex-shrink-0 cursor-pointer"
          >
            Previous
          </Button>

          <div className="flex gap-1 flex-shrink-0">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                onClick={() => setCurrentPage(i + 1)}
                className={`cursor-pointer text-sm h-10 w-10 p-0 rounded-lg ${currentPage === i + 1
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
            className="border-border text-sm h-10 px-4 flex-shrink-0 cursor-pointer"
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {paginatedTours.length === 0 && !isLoading && !error && (
        <Card className="p-8 sm:p-12 border-border text-center bg-secondary/30">
          <p className="text-muted-foreground mb-6 text-sm sm:text-base font-medium">No tours found matching your search.</p>
          <Button
            variant="outline"
            className="cursor-pointer border-border bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-10 px-6 rounded-lg"
            onClick={() => setSearchTerm('')}
          >
            Clear Search
          </Button>
        </Card>
      )}
    </div>
  )
}
