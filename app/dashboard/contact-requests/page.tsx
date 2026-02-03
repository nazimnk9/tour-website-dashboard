'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye } from 'lucide-react'
import { mockContactRequests } from '@/app/lib/mock-data'
import { StatusModal } from '@/components/dashboard/status-modal'
import { ContactRequestModal } from '@/components/dashboard/contact-request-modal'

const ITEMS_PER_PAGE = 10

export default function ContactRequestsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  const totalPages = Math.ceil(mockContactRequests.length / ITEMS_PER_PAGE)
  const paginatedRequests = mockContactRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const selectedRequest = mockContactRequests.find((r) => r.id === selectedRequestId)

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

  const handleStatusChange = (requestId: string, newStatus: string) => {
    console.log(`Request ${requestId} status changed to ${newStatus}`)
    setStatusModalOpen(false)
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Contact Requests</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage customer inquiries and requests</p>
      </div>

      {/* Requests Table - Responsive */}
      <Card className="border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-secondary hover:bg-secondary">
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">ID</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Name</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Email</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Status</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Created</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.map((request) => (
                <TableRow key={request.id} className="border-border hover:bg-secondary/50 transition-colors">
                  <TableCell className="font-medium text-foreground text-xs sm:text-sm truncate">{request.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm truncate">{request.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm truncate">{request.email}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(request.status)} text-xs sm:text-sm`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm">
                    {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-primary hover:bg-primary/10 bg-transparent text-xs h-8 px-2 rounded"
                        onClick={() => {
                          setSelectedRequestId(request.id)
                          setDetailsModalOpen(true)
                        }}
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline ml-1">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-primary hover:bg-primary/10 bg-transparent text-xs h-8 px-2 rounded"
                        onClick={() => {
                          setSelectedRequestId(request.id)
                          setStatusModalOpen(true)
                        }}
                      >
                        Status
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="border-border text-sm h-10 px-4 flex-shrink-0"
          >
            Previous
          </Button>

          <div className="flex gap-1 flex-shrink-0">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                onClick={() => setCurrentPage(i + 1)}
                className={`text-sm h-10 w-10 p-0 rounded-lg ${
                  currentPage === i + 1
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
            className="border-border text-sm h-10 px-4 flex-shrink-0"
          >
            Next
          </Button>
        </div>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <ContactRequestModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false)
            setSelectedRequestId(null)
          }}
          request={selectedRequest}
        />
      )}

      {/* Status Modal */}
      {selectedRequest && (
        <StatusModal
          isOpen={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false)
            setSelectedRequestId(null)
          }}
          onSave={(newStatus) => handleStatusChange(selectedRequestId!, newStatus)}
          currentStatus={selectedRequest.status}
          statusOptions={['new', 'in-progress', 'resolved']}
        />
      )}
    </div>
  )
}
