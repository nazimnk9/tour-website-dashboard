'use client'

import { useState, useEffect } from 'react'
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
import { Eye, Loader2, AlertCircle } from 'lucide-react'
import { StatusModal } from '@/components/dashboard/status-modal'
import { ContactRequestModal } from '@/components/dashboard/contact-request-modal'
import { getContactRequests, ContactRequest } from '@/app/lib/api'
import { useAuth } from '@/app/contexts/auth-context'

const ITEMS_PER_PAGE = 10

interface UIContactRequest {
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

export default function ContactRequestsPage() {
  const { token } = useAuth()
  const [requests, setRequests] = useState<UIContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  const fetchRequests = async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = await getContactRequests(token)
      const mapped = data.results.map((r: any) => ({
        id: String(r.id),
        name: `${r.first_name} ${r.last_name}`,
        email: r.email,
        message: r.message,
        status: r.status,
        createdAt: r.created_at || new Date().toISOString(),
        subject: r.subject,
        phone: r.phone,
        cancelled_reason: r.cancelled_reason
      }))
      setRequests(mapped)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching contact requests:', err)
      setError('Failed to load contact requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [token])

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE)
  const paginatedRequests = requests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const selectedRequest = requests.find((r) => r.id === selectedRequestId)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'completed':
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

  const handleStatusChange = () => {
    fetchRequests()
  }

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-foreground">{error}</p>
        <Button onClick={() => fetchRequests()}>Try Again</Button>
      </div>
    )
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
              {paginatedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No contact requests found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRequests.map((request) => (
                  <TableRow key={request.id} className="border-border hover:bg-secondary/50 transition-colors">
                    <TableCell className="font-medium text-foreground text-xs sm:text-sm truncate">#{request.id}</TableCell>
                    <TableCell className="text-muted-foreground text-xs sm:text-sm truncate">{request.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs sm:text-sm truncate break-all">{request.email}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(request.status)} text-xs sm:text-sm`}>
                        {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs sm:text-sm">
                      {request.createdAt !== 'N/A'
                        ? new Date(request.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border text-black/80 hover:text-black/80 hover:bg-primary/10 bg-transparent text-xs h-8 px-2 rounded"
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
                          className="border-border text-black/80 hover:text-black/80 hover:bg-primary/10 bg-transparent text-xs h-8 px-2 rounded"
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
                ))
              )}
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
            className="border-border text-sm h-10 px-4 flex-shrink-0 rounded-lg hover:bg-secondary transition-all"
          >
            Previous
          </Button>

          <div className="flex gap-1 flex-shrink-0">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                onClick={() => setCurrentPage(i + 1)}
                className={`text-sm h-10 w-10 p-0 rounded-lg transition-all ${currentPage === i + 1
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
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
            className="border-border text-sm h-10 px-4 flex-shrink-0 rounded-lg hover:bg-secondary transition-all"
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
      {selectedRequest && token && (
        <StatusModal
          isOpen={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false)
            setSelectedRequestId(null)
          }}
          onSave={handleStatusChange}
          currentStatus={selectedRequest.status}
          id={selectedRequest.id}
          token={token}
          type="contact"
          statusOptions={["open", "in_review", "cancelled", "completed"]}
        />
      )}
    </div>
  )
}
