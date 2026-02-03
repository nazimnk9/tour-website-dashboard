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
import { Plus } from 'lucide-react'
import { mockNotices } from '@/app/lib/mock-data'

export default function NoticesPage() {
  const [notices, setNotices] = useState(mockNotices)
  const [activeNoticeId, setActiveNoticeId] = useState<string | null>(
    notices.find((n) => n.isActive)?.id || null
  )

  const activeNotice = notices.find((n) => n.id === activeNoticeId)

  const handleActivateNotice = (noticeId: string) => {
    setNotices(
      notices.map((notice) => ({
        ...notice,
        isActive: notice.id === noticeId,
      }))
    )
    setActiveNoticeId(noticeId)
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Notices</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage important announcements and system notices</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 whitespace-nowrap text-sm sm:text-base px-4 py-2 h-10 sm:h-11 rounded-lg">
          <Plus size={20} />
          Create Notice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notices List - Left Column */}
        <Card className="lg:col-span-1 border-border overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-border bg-secondary">
            <h2 className="font-bold text-foreground text-sm sm:text-base">All Notices</h2>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Title</TableHead>
                  <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((notice) => (
                  <TableRow
                    key={notice.id}
                    className={`border-border hover:bg-secondary/50 transition-colors cursor-pointer ${
                      notice.id === activeNoticeId ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <TableCell className="text-xs sm:text-sm font-medium text-foreground truncate">
                      {notice.title}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={notice.id === activeNoticeId ? 'default' : 'outline'}
                        onClick={() => handleActivateNotice(notice.id)}
                        className={`text-xs h-8 rounded ${
                          notice.id === activeNoticeId
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'border-border text-primary hover:bg-primary/10 bg-transparent'
                        }`}
                      >
                        {notice.id === activeNoticeId ? 'Active' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Active Notice Display - Right Column */}
        <div className="lg:col-span-2">
          {activeNotice ? (
            <Card className="border-border overflow-hidden h-full shadow-sm flex flex-col">
              <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground">{activeNotice.title}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      Created: {new Date(activeNotice.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm px-3 py-1">Active</Badge>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                  {activeNotice.content}
                </p>
              </div>

              <div className="p-4 sm:p-6 border-t border-border bg-secondary/50 flex gap-2 sm:gap-3 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1 border-border text-primary hover:bg-primary/10 bg-transparent text-sm h-10 rounded-lg font-semibold"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-border text-destructive hover:bg-destructive/10 bg-transparent text-sm h-10 rounded-lg font-semibold"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="border-border p-8 sm:p-12 flex items-center justify-center h-full shadow-sm bg-secondary/30">
              <div className="text-center">
                <p className="text-muted-foreground mb-6 text-sm sm:text-base font-medium">No active notice selected</p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-10 px-6 rounded-lg">
                  Select a Notice or Create New
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
