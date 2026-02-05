'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Plus, Edit } from 'lucide-react'
import { TimeFormModal } from '@/components/dashboard/time-form-modal'

interface TimeSlot {
  id: string
  time: string
  capacity: number
  tickets: {
    adult: { tickets: number; price: number }
    child: { tickets: number; price: number }
    infant: { tickets: number; price: number }
    youth: { tickets: number; price: number }
    studentEU: { tickets: number; price: number }
  }
}

export default function TimesPage() {
  const params = useParams()
  const tourId = params.id as string
  const dateId = params.dateId as string
  
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      time: '09:00 AM',
      capacity: 50,
      tickets: {
        adult: { tickets: 30, price: 45 },
        child: { tickets: 15, price: 25 },
        infant: { tickets: 5, price: 0 },
        youth: { tickets: 10, price: 35 },
        studentEU: { tickets: 8, price: 30 },
      },
    },
  ])
  
  const [timeModalOpen, setTimeModalOpen] = useState(false)
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null)

  const selectedDate = new Date(dateId).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleSaveTime = (timeData: any) => {
    if (editingTimeId) {
      setTimeSlots(
        timeSlots.map((slot) =>
          slot.id === editingTimeId ? { ...slot, ...timeData, id: slot.id } : slot
        )
      )
      setEditingTimeId(null)
    } else {
      setTimeSlots([
        ...timeSlots,
        { ...timeData, id: Date.now().toString() },
      ])
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/tours/${tourId}`}>
          <Button variant="outline" size="icon" className="border-border bg-transparent">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Time Slots for {selectedDate}
          </h1>
          <p className="text-muted-foreground">Manage available time slots and tickets</p>
        </div>
      </div>

      {/* Add New Time Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingTimeId(null)
            setTimeModalOpen(true)
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Time
        </Button>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timeSlots.map((slot) => (
          <Card key={slot.id} className="border-border overflow-hidden hover:shadow-lg transition-shadow">
            {/* Time Header */}
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 border-b border-border">
              <h3 className="text-2xl font-bold text-primary mb-1">{slot.time}</h3>
              <p className="text-sm text-muted-foreground">Capacity: {slot.capacity}</p>
            </div>

            {/* Ticket Details */}
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">Adult</Badge>
                  <span className="text-sm font-semibold">
                    {slot.tickets.adult.tickets} tickets
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">Child</Badge>
                  <span className="text-sm font-semibold">
                    {slot.tickets.child.tickets} tickets
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">Infant</Badge>
                  <span className="text-sm font-semibold">
                    {slot.tickets.infant.tickets} tickets
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">Youth</Badge>
                  <span className="text-sm font-semibold">
                    {slot.tickets.youth.tickets} tickets
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">Student EU</Badge>
                  <span className="text-sm font-semibold">
                    {slot.tickets.studentEU.tickets} tickets
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                onClick={() => {
                  setEditingTimeId(slot.id)
                  setTimeModalOpen(true)
                }}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {timeSlots.length === 0 && (
        <Card className="p-12 border-border text-center">
          <p className="text-muted-foreground mb-4">No time slots scheduled for this date</p>
          <Button
            onClick={() => {
              setEditingTimeId(null)
              setTimeModalOpen(true)
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Add First Time Slot
          </Button>
        </Card>
      )}

      {/* Time Form Modal */}
      <TimeFormModal
        isOpen={timeModalOpen}
        onClose={() => {
          setTimeModalOpen(false)
          setEditingTimeId(null)
        }}
        onSave={handleSaveTime}
        mode={editingTimeId ? 'edit' : 'create'}
      />
    </div>
  )
}
