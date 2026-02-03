'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TicketType {
  tickets: number
  price: number
}

interface TimeFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (timeData: any) => void
  mode: 'create' | 'edit'
}

export function TimeFormModal({
  isOpen,
  onClose,
  onSave,
  mode,
}: TimeFormModalProps) {
  const [time, setTime] = useState('09:00')
  const [adult, setAdult] = useState<TicketType>({ tickets: 0, price: 45 })
  const [child, setChild] = useState<TicketType>({ tickets: 0, price: 25 })
  const [infant, setInfant] = useState<TicketType>({ tickets: 0, price: 0 })
  const [youth, setYouth] = useState<TicketType>({ tickets: 0, price: 35 })
  const [studentEU, setStudentEU] = useState<TicketType>({ tickets: 0, price: 30 })

  const handleSave = () => {
    onSave({
      time,
      capacity: 50,
      tickets: {
        adult,
        child,
        infant,
        youth,
        studentEU,
      },
    })
    onClose()
  }

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
  ]

  const TicketInputs = ({ 
    title, 
    state, 
    setState 
  }: { 
    title: string
    state: TicketType
    setState: (state: TicketType) => void
  }) => (
    <div className="space-y-3 border-t border-border pt-4">
      <h3 className="font-medium text-foreground">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${title}-tickets`} className="text-sm">
            Tickets
          </Label>
          <Input
            id={`${title}-tickets`}
            type="number"
            min="0"
            value={state.tickets}
            onChange={(e) =>
              setState({ ...state, tickets: parseInt(e.target.value) || 0 })
            }
            className="border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${title}-price`} className="text-sm">
            Price
          </Label>
          <Input
            id={`${title}-price`}
            type="number"
            min="0"
            step="0.01"
            value={state.price}
            onChange={(e) =>
              setState({ ...state, price: parseFloat(e.target.value) || 0 })
            }
            className="border-border"
          />
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Time Slot' : 'Edit Time Slot'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time-select" className="text-foreground">
              Select Time
            </Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger id="time-select" className="border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ticket Types */}
          <TicketInputs title="Adult" state={adult} setState={setAdult} />
          <TicketInputs title="Child" state={child} setState={setChild} />
          <TicketInputs title="Infant" state={infant} setState={setInfant} />
          <TicketInputs title="Youth" state={youth} setState={setYouth} />
          <TicketInputs title="Student EU" state={studentEU} setState={setStudentEU} />
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 border-t border-border pt-6 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {mode === 'create' ? 'Create Time Slot' : 'Update Time Slot'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
