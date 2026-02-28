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
  subject: string
  phone: string
  cancelled_reason: string | null
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
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'in_review':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'open':
      case 'new':
        return 'bg-purple-100 text-purple-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-none shadow-lg outline-none p-0 overflow-hidden rounded-xl">
        <Card className="border-none shadow-none p-0 max-h-[90vh] flex flex-col">
          {/* Header inside Card */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-foreground tracking-tight">Contact Request Details</DialogTitle>
              {/* <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button> */}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="p-6 overflow-y-auto space-y-8">
            <div className="space-y-6">
              {/* ID & Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Request ID</p>
                  <p className="text-base font-semibold text-foreground">#{request.id}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-base font-bold text-primary">{request.subject || 'No Subject'}</p>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-base font-semibold text-foreground">{request.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-base font-semibold text-foreground break-all">{request.email}</p>
                </div>
              </div>

              {/* Phone & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="text-base font-semibold text-foreground">{request.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Current Status</p>
                  <Badge className={`${getStatusColor(request.status)} border-none shadow-none text-xs font-bold px-3 py-1 rounded-full`}>
                    {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Submitted At</p>
                <p className="text-base font-medium text-foreground">
                  {new Date(request.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {/* Cancelled Reason */}
              {request.cancelled_reason && (
                <div className="border-t border-border pt-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-4">Cancellation Reason</p>
                  <div className="bg-red-50/50 p-5 rounded-xl border border-red-100">
                    <p className="text-red-900 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                      {request.cancelled_reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="border-t border-border pt-8">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Customer Message</p>
                <div className="bg-secondary/30 p-5 rounded-xl border border-border/50">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm font-medium">
                    {request.message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer inside Card */}
          <div className="p-6 border-t border-border bg-gray-50/50">
            <div className="flex justify-end">
              <Button
                onClick={onClose}
                className="bg-primary hover:bg-primary/90 text-white font-bold px-10 h-11 rounded-lg shadow-sm transition-all active:scale-95"
              >
                Close
              </Button>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
