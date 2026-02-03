'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface ContactRequest {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: string
}

interface ContactRequestModalProps {
  isOpen: boolean
  onClose: () => void
  request: ContactRequest
}

export function ContactRequestModal({
  isOpen,
  onClose,
  request,
}: ContactRequestModalProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'new':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Contact Request Details</DialogTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>
        </DialogHeader>

        <Card className="p-6 border-border">
          <div className="space-y-6">
            {/* Request Info */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Request ID</p>
              <p className="text-lg font-semibold text-foreground">{request.id}</p>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Name</p>
                <p className="text-lg font-semibold text-foreground">{request.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Email</p>
                <p className="text-lg font-semibold text-foreground">{request.email}</p>
              </div>
            </div>

            {/* Status & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <Badge className={getStatusColor(request.status)} variant="outline">
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Submitted Date</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground mb-3">Message</p>
              <div className="bg-secondary p-4 rounded-lg border border-border">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {request.message}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Button */}
        <div className="flex justify-end border-t border-border pt-6">
          <Button
            onClick={onClose}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
