'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface DateItem {
  id: string
  date: string
}

interface DateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (dates: DateItem[]) => void
  initialDates: DateItem[]
}

export function DateModal({
  isOpen,
  onClose,
  onSave,
  initialDates,
}: DateModalProps) {
  const [dates, setDates] = useState<DateItem[]>(initialDates)
  const [newDate, setNewDate] = useState('')

  const handleAddDate = () => {
    if (newDate.trim()) {
      setDates([...dates, { id: Date.now().toString(), date: newDate }])
      setNewDate('')
    }
  }

  const handleRemoveDate = (id: string) => {
    setDates(dates.filter((d) => d.id !== id))
  }

  const handleSave = () => {
    onSave(dates)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Date</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dates List */}
          {dates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Scheduled Dates</h3>
              <div className="space-y-2 mb-4">
                {dates.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-secondary p-3 rounded-lg border border-border"
                  >
                    <Badge variant="default">{item.date}</Badge>
                    <button
                      onClick={() => handleRemoveDate(item.id)}
                      className="text-destructive hover:bg-destructive/10 p-2 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Date Form */}
          <div className="space-y-4 border-t border-border pt-6">
            <div className="space-y-2">
              <Label htmlFor="new-date" className="text-foreground">
                Select Date
              </Label>
              <Input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="border-border"
              />
            </div>

            <Button
              onClick={handleAddDate}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add Date
            </Button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 border-t border-border pt-6">
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
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
