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

interface StatusModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newStatus: string) => void
  currentStatus: string
  statusOptions: string[]
}

export function StatusModal({
  isOpen,
  onClose,
  onSave,
  currentStatus,
  statusOptions,
}: StatusModalProps) {
  const [newStatus, setNewStatus] = useState(currentStatus)

  const handleSave = () => {
    onSave(newStatus)
    onClose()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'new':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
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
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
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
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            Update Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
