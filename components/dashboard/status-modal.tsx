'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { updateBookingStatus } from '@/app/lib/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface StatusModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  currentStatus: string
  bookingId: number
  token: string
}

export function StatusModal({
  isOpen,
  onClose,
  onSave,
  currentStatus,
  bookingId,
  token,
}: StatusModalProps) {
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [cancelledReason, setCancelledReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [alertMessage, setAlertMessage] = useState('')

  const statusOptions = ["open", "in_review", "accepted", "cancelled", "completed"]

  const handleSave = async () => {
    try {
      setLoading(true)
      const payload: { status: string, cancelled_reason?: string | null } = { status: newStatus }
      if (newStatus === 'cancelled') {
        payload.cancelled_reason = cancelledReason
      } else {
        payload.cancelled_reason = null
      }

      await updateBookingStatus(token, bookingId, payload)
      setAlertType('success')
      setAlertMessage('Booking status has been updated successfully.')
      setShowAlert(true)
    } catch (err: any) {
      console.error('Error updating status:', err)
      setAlertType('error')
      let errorMessage = 'Failed to update booking status.'
      if (err.status && Array.isArray(err.status)) {
        errorMessage = err.status.join(', ')
      } else if (err.detail) {
        errorMessage = err.detail
      }
      setAlertMessage(errorMessage)
      setShowAlert(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAlertClose = () => {
    setShowAlert(false)
    if (alertType === 'success') {
      onSave()
      onClose()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'accepted':
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'open':
      case 'in_review':
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Status */}
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Current Status</Label>
              <Badge className={getStatusColor(currentStatus)} variant="outline">
                {currentStatus.replace('_', ' ').charAt(0).toUpperCase() + currentStatus.replace('_', ' ').slice(1)}
              </Badge>
            </div>

            {/* Change Status */}
            <div className="space-y-2 border-t border-border pt-6">
              <Label htmlFor="status-select" className="text-foreground">
                Change Status To
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status-select" className="border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cancelled Reason */}
            {newStatus === 'cancelled' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="cancelled-reason" className="text-foreground">
                  Cancelled Reason
                </Label>
                <Textarea
                  id="cancelled-reason"
                  placeholder="Enter reason for cancellation..."
                  value={cancelledReason}
                  onChange={(e) => setCancelledReason(e.target.value)}
                  className="border-border min-h-[100px]"
                />
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2 border-t border-border pt-6 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border bg-transparent"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading || (newStatus === currentStatus && (newStatus !== 'cancelled' || !cancelledReason))}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
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
            <AlertDialogAction onClick={handleAlertClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
