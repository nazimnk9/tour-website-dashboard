'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { X, Loader2 } from 'lucide-react'
import {
  fetchTourDates,
  addTourDate,
  deleteTourDate,
  resetStatus
} from '@/app/lib/redux/tour-date-slice'
import { RootState, AppDispatch } from '@/app/lib/redux/store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DateItem {
  id: string
  date: string
}

interface DateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (dates: any[]) => void
  initialDates: any[]
  tourId: number
}

export function DateModal({
  isOpen,
  onClose,
  onSave,
  tourId,
}: DateModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { dates, isLoading, error, success } = useSelector((state: RootState) => state.tourDate)

  const [newDate, setNewDate] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [alertMessage, setAlertMessage] = useState('')

  useEffect(() => {
    if (isOpen && tourId) {
      dispatch(fetchTourDates(tourId))
    }
  }, [isOpen, tourId, dispatch])

  useEffect(() => {
    if (success) {
      setAlertType('success')
      setAlertMessage('Date added successfully!')
      setShowAlert(true)
      setNewDate('')
      dispatch(resetStatus())
    }
    if (error) {
      setAlertType('error')
      const errorMessage = typeof error === 'object' && error.date
        ? error.date[0]
        : 'Something went wrong. Please try again.'
      setAlertMessage(errorMessage)
      setShowAlert(true)
      dispatch(resetStatus())
    }
  }, [success, error, dispatch])

  const handleAddDate = () => {
    if (newDate.trim() && tourId) {
      dispatch(addTourDate({ date: newDate, tour_id: tourId }))
    }
  }

  const handleRemoveDate = (dateId: number) => {
    if (tourId) {
      dispatch(deleteTourDate({ tourId, dateId }))
    }
  }

  const handleSave = () => {
    onSave(dates)
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Date</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Dates List */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Scheduled Dates</h3>
              {isLoading && dates.length === 0 ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : dates.length > 0 ? (
                <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto pr-2">
                  {dates.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-secondary p-3 rounded-lg border border-border"
                    >
                      <Badge variant="default">{item.date}</Badge>
                      <button
                        onClick={() => handleRemoveDate(item.id)}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded cursor-pointer transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No dates added yet</p>
              )}
            </div>

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

              {/* <Button
                onClick={handleAddDate}
                disabled={isLoading || !newDate}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add Date
              </Button> */}
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
              onClick={handleAddDate}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Date
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertType === 'success' ? 'Success' : 'Error'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
