'use client'

import { useState, useEffect } from 'react'
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
import { createTourTime, updateTourTime, TourTime } from '@/app/lib/api'
import { getCookie } from '@/app/lib/cookies'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from 'lucide-react'

interface TimeFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  mode: 'create' | 'edit'
  tourDateId: string
  initialData?: TourTime | null
}

export function TimeFormModal({
  isOpen,
  onClose,
  onSave,
  mode,
  tourDateId,
  initialData,
}: TimeFormModalProps) {
  const [startTime, setStartTime] = useState('08:00')
  const [availableAdults, setAvailableAdults] = useState<number | string>('')
  const [availableChildren, setAvailableChildren] = useState<number | string>('')
  const [availableInfants, setAvailableInfants] = useState<number | string>('')
  const [availableYouth, setAvailableYouth] = useState<number | string>('')
  const [availableStudentEU, setAvailableStudentEU] = useState<number | string>('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'success'
  })

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setStartTime(initialData.start_time.substring(0, 5)) // Format "09:00:00" to "09:00"
      setAvailableAdults(initialData.available_adults)
      setAvailableChildren(initialData.available_children)
      setAvailableInfants(initialData.available_infants)
      setAvailableYouth(initialData.available_youth)
      setAvailableStudentEU(initialData.available_student_eu)
    } else {
      setStartTime('08:00')
      setAvailableAdults('')
      setAvailableChildren('')
      setAvailableInfants('')
      setAvailableYouth('')
      setAvailableStudentEU('')
    }
  }, [mode, initialData, isOpen])

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      const token = getCookie('access_token')
      if (!token) {
        setAlertConfig({
          show: true,
          title: 'Error',
          message: 'Authentication token not found. Please log in again.',
          type: 'error'
        })
        return
      }

      const payload = {
        start_time: startTime,
        available_adults: parseInt(availableAdults.toString()) || 0,
        available_children: parseInt(availableChildren.toString()) || 0,
        available_infants: parseInt(availableInfants.toString()) || 0,
        available_youth: parseInt(availableYouth.toString()) || 0,
        available_student_eu: parseInt(availableStudentEU.toString()) || 0,
      }

      let response;
      if (mode === 'create') {
        response = await createTourTime(token, tourDateId, payload)
        setAlertConfig({
          show: true,
          title: 'Success',
          message: 'Time slot created successfully.',
          type: 'success'
        })
      } else if (mode === 'edit' && initialData) {
        response = await updateTourTime(token, tourDateId, initialData.id.toString(), payload)
        setAlertConfig({
          show: true,
          title: 'Success',
          message: 'Time slot updated successfully.',
          type: 'success'
        })
      }
    } catch (err: any) {
      let errorMessage = 'Something went wrong. Please try again.'
      if (err) {
        const errorDetails = Object.entries(err).map(([key, value]) => {
          if (Array.isArray(value)) return `${key}: ${value.join(', ')}`
          return `${key}: ${value}`
        }).join('\n')
        errorMessage = errorDetails || errorMessage
      }
      setAlertConfig({
        show: true,
        title: 'Error',
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAlertClose = () => {
    const isSuccess = alertConfig.type === 'success'
    setAlertConfig(prev => ({ ...prev, show: false }))
    if (isSuccess) {
      onSave()
      onClose()
    }
  }

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
  ]

  return (
    <>
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
                Start Time
              </Label>
              <Select value={startTime} onValueChange={setStartTime}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults">Available Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  placeholder="0"
                  value={availableAdults}
                  onChange={(e) => setAvailableAdults(e.target.value)}
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children">Available Children</Label>
                <Input
                  id="children"
                  type="number"
                  placeholder="0"
                  value={availableChildren}
                  onChange={(e) => setAvailableChildren(e.target.value)}
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="infants">Available Infants</Label>
                <Input
                  id="infants"
                  type="number"
                  placeholder="0"
                  value={availableInfants}
                  onChange={(e) => setAvailableInfants(e.target.value)}
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youth">Available Youth</Label>
                <Input
                  id="youth"
                  type="number"
                  placeholder="0"
                  value={availableYouth}
                  onChange={(e) => setAvailableYouth(e.target.value)}
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentEU">Available Student EU</Label>
                <Input
                  id="studentEU"
                  type="number"
                  placeholder="0"
                  value={availableStudentEU}
                  onChange={(e) => setAvailableStudentEU(e.target.value)}
                  className="border-border"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2 border-t border-border pt-6 mt-6 cursor-pointer">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border-border bg-transparent cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                mode === 'create' ? 'Create Time Slot' : 'Update Time Slot'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertConfig.show} onOpenChange={handleAlertClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {alertConfig.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleAlertClose} className="cursor-pointer">OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
