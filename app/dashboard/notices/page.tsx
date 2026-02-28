'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Loader2, Edit, Trash2, CheckCircle2, AlertCircle, Info, Save } from 'lucide-react'
import { getNotices, getNoticeDetail, deleteNotice, updateNotice, Notice } from '@/app/lib/api'
import { getCookie } from '@/app/lib/cookies'

export default function NoticesPage() {
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeNoticeId, setActiveNoticeId] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [editFormData, setEditFormData] = useState({ title: '', description: '' })

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null)

  // Alert State
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

  const fetchNotices = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = getCookie('access_token')
      if (token) {
        const response = await getNotices(token)
        setNotices(response.results)

        // Auto-select active notice or first notice if none active
        const active = response.results.find(n => n.is_active)
        if (active) {
          setActiveNoticeId(active.id)
        } else if (response.results.length > 0) {
          setActiveNoticeId(response.results[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  const activeNotice = notices.find((n) => n.is_active)

  const handleActivateNotice = async (noticeId: number) => {
    try {
      setIsProcessing(true)
      const token = getCookie('access_token')
      if (!token) throw new Error('Auth token not found')

      await updateNotice(token, noticeId.toString(), { is_active: true })

      setAlertConfig({
        show: true,
        title: 'Success',
        message: 'Notice activated successfully.',
        type: 'success'
      })

      fetchNotices()
    } catch (err) {
      console.error('Activation error:', err)
      setAlertConfig({
        show: true,
        title: 'Error',
        message: 'Failed to activate notice.',
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteNotice = async () => {
    if (!noticeToDelete) return
    try {
      setIsProcessing(true)
      const token = getCookie('access_token')
      if (!token) throw new Error('Auth token not found')

      await deleteNotice(token, noticeToDelete.id.toString())

      setAlertConfig({
        show: true,
        title: 'Success',
        message: 'Notice deleted successfully.',
        type: 'success'
      })

      if (activeNoticeId === noticeToDelete.id) {
        setActiveNoticeId(null)
      }
      fetchNotices()
    } catch (err) {
      console.error('Deletion error:', err)
      setAlertConfig({
        show: true,
        title: 'Error',
        message: 'Failed to delete notice.',
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
      setIsDeleteDialogOpen(false)
      setNoticeToDelete(null)
    }
  }

  const handleOpenEdit = async (notice: Notice) => {
    try {
      setIsProcessing(true)
      const token = getCookie('access_token')
      if (!token) throw new Error('Auth token not found')

      const detail = await getNoticeDetail(token, notice.id.toString())
      setEditingNotice(detail)
      setEditFormData({ title: detail.title, description: detail.description })
      setIsEditModalOpen(true)
    } catch (err) {
      console.error('Failed to fetch notice detail:', err)
      setAlertConfig({
        show: true,
        title: 'Error',
        message: 'Failed to fetch latest notice details.',
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNotice) return

    try {
      setIsProcessing(true)
      const token = getCookie('access_token')
      if (!token) throw new Error('Auth token not found')

      await updateNotice(token, editingNotice.id.toString(), editFormData)

      setAlertConfig({
        show: true,
        title: 'Success',
        message: 'Notice updated successfully.',
        type: 'success'
      })

      setIsEditModalOpen(false)
      fetchNotices()
    } catch (err: any) {
      console.error('Update error:', err)
      let errorMessage = 'Failed to update notice.'
      if (err) {
        errorMessage = Object.entries(err).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n') || errorMessage
      }
      setAlertConfig({
        show: true,
        title: 'Error',
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground mb-2">Notices</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage important announcements and system notices</p>
        </div>
        <Link href="/dashboard/notices/create">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 whitespace-nowrap text-sm sm:text-base px-4 py-2 h-10 sm:h-11 rounded-lg cursor-pointer transition-all active:scale-95 shadow-md">
            <Plus size={20} />
            Create Notice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notices List - Left Column */}
        <Card className="lg:col-span-1 border-border overflow-hidden shadow-sm flex flex-col h-fit">
          <div className="p-4 sm:p-5 border-b border-border bg-secondary flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-sm sm:text-base flex items-center gap-2">
              <Info size={18} className="text-primary" />
              All Notices
            </h2>
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
              {notices.length} Total
            </Badge>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 flex justify-center items-center">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/30">
                    <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Title</TableHead>
                    <TableHead className="text-foreground text-xs sm:text-sm font-semibold text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notices.map((notice) => (
                    <TableRow
                      key={notice.id}
                      onClick={() => setActiveNoticeId(notice.id)}
                      className={`border-border hover:bg-primary/5 transition-colors cursor-pointer group ${notice.id === activeNoticeId ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                        }`}
                    >
                      <TableCell className="text-xs sm:text-sm font-medium text-foreground py-4">
                        <div className="flex flex-col gap-1">
                          <span className="truncate max-w-[150px]">{notice.title}</span>
                          {notice.id === activeNoticeId && <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">Viewing</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            disabled={isProcessing || notice.is_active}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleActivateNotice(notice.id)
                            }}
                            className={`cursor-pointer text-xs h-7 px-3 rounded shadow-sm transition-all ${notice.is_active
                              ? 'bg-primary text-primary-foreground opacity-100'
                              : 'bg-transparent border border-primary/30 text-primary hover:bg-primary hover:text-white'
                              }`}
                          >
                            {notice.is_active ? 'Active' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            disabled={isProcessing}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenEdit(notice)
                            }}
                            variant="outline"
                            className="cursor-pointer text-xs h-7 px-3 rounded border-border text-primary hover:bg-primary/10 bg-transparent flex items-center gap-1 shadow-sm font-semibold"
                          >
                            <Edit size={14} />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {notices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="h-40 text-center text-muted-foreground italic">
                        No notices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        {/* Active Notice Display - Right Column */}
        <div className="lg:col-span-2">
          {activeNotice ? (
            <Card className="border-border overflow-hidden h-full shadow-md flex flex-col bg-background relative border-t-4 border-t-primary">
              <div className="p-6 border-b border-border bg-muted/20">
                <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">{activeNotice.title}</h2>
                      {activeNotice.is_active && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 animate-pulse">LIVE NOW</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary/40" />
                      System Announcement ID: #{activeNotice.id}
                    </div>
                  </div>
                  <Badge className={`${activeNotice.is_active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} text-xs sm:text-sm px-4 py-1.5 font-semibold uppercase tracking-widest`}>
                    {activeNotice.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="p-8 flex-1 overflow-y-auto bg-square-pattern">
                <div className="bg-muted/5 p-6 rounded-xl border border-border/50 shadow-inner min-h-[250px]">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base font-medium">
                    {activeNotice.description}
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-muted/30 flex gap-4 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => handleOpenEdit(activeNotice)}
                  className="flex-1 border-primary/20 text-primary hover:bg-primary/10 bg-transparent text-sm h-12 rounded-xl font-semibold flex items-center gap-2 cursor-pointer transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  <Edit size={18} />
                  Edit Notice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNoticeToDelete(activeNotice)
                    setIsDeleteDialogOpen(true)
                  }}
                  className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/10 bg-transparent text-sm h-12 rounded-xl font-semibold flex items-center gap-2 cursor-pointer transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  <Trash2 size={18} />
                  Delete Permanent
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="border-border p-12 flex items-center justify-center h-full shadow-sm bg-muted/10 border-dashed min-h-[500px]">
              <div className="text-center max-w-sm space-y-4">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Info size={40} className="text-primary opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No Notice Selected</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Select a notice from the left panel to view details, edit or manage its status.
                </p>
                <Button
                  onClick={() => router.push('/dashboard/notices/create')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-11 px-8 rounded-xl font-semibold mt-4 shadow-lg shadow-primary/20"
                >
                  Create New Announcement
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-background border-border shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Edit className="text-primary" />
                Update Notice
              </DialogTitle>
            </DialogHeader>
          </div>
          <form onSubmit={handleUpdateNotice} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-foreground font-semibold">Notice Title</Label>
                <Input
                  id="edit-title"
                  placeholder="The headline of your notice"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="h-12 border-border focus:ring-primary bg-secondary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc" className="text-foreground font-semibold">Content Description</Label>
                <Textarea
                  id="edit-desc"
                  placeholder="Describe the announcement in detail..."
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="min-h-[250px] border-border focus:ring-primary bg-secondary/20 leading-relaxed text-base"
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-4 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="h-12 px-6 border-border font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Update Notice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md border-destructive/20 bg-background/95 backdrop-blur-lg rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-3 scale-110 origin-left">
              <div className="bg-destructive/10 p-2 rounded-full">
                <Trash2 size={24} />
              </div>
              <AlertDialogTitle className="text-2xl font-black tracking-tight">Erase Announcement?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-foreground/80 font-semibold text-base leading-relaxed">
              This will permanently remove
              <span className="text-destructive px-1.5 font-black block mt-2 bg-destructive/5 py-2 rounded border border-destructive/10 italic">"{noticeToDelete?.title}"</span>
              This action represents a permanent deletion from the system and cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="cursor-pointer border-border bg-muted/20 hover:bg-muted h-12 px-6 rounded-xl font-semibold transition-all">
              Discard Action
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNotice}
              disabled={isProcessing}
              className="cursor-pointer bg-destructive hover:bg-destructive/90 text-white border-0 h-12 px-8 rounded-xl font-semibold shadow-lg shadow-destructive/20 transition-all active:scale-95"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Delete Permanent'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog Feedback */}
      <AlertDialog
        open={alertConfig.show}
        onOpenChange={(v) => setAlertConfig({ ...alertConfig, show: v })}
      >
        <AlertDialogContent className="max-w-md border-0 bg-background/95 backdrop-blur-lg shadow-2xl rounded-2xl">
          <div className={`absolute top-0 left-0 w-full h-1.5 ${alertConfig.type === 'success' ? 'bg-primary' : 'bg-destructive'} rounded-t-2xl`} />
          <AlertDialogHeader>
            <div className={`flex items-center gap-3 ${alertConfig.type === 'success' ? 'text-primary' : 'text-destructive'} mb-2`}>
              {alertConfig.type === 'success' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
              <AlertDialogTitle className="text-2xl font-black tracking-tight">{alertConfig.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-foreground/80 text-base font-semibold whitespace-pre-line leading-relaxed">
              {alertConfig.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogAction
              onClick={() => setAlertConfig({ ...alertConfig, show: false })}
              className={`cursor-pointer ${alertConfig.type === 'success' ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'bg-destructive hover:bg-destructive/90 shadow-destructive/20'} text-white border-0 px-10 h-12 rounded-xl font-semibold shadow-lg transition-all active:scale-95`}
            >
              Dismiss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
