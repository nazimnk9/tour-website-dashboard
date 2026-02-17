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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { UserFormModal } from '@/components/dashboard/user-form-modal'
import { getAuthUsers, AuthUser, deleteAuthUser } from '@/app/lib/api'
import { useAuth } from '@/app/contexts/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { token, user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AuthUser[]>([])

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      router.push('/dashboard')
    }
  }, [user, router])

  if (user && user.role === 'ADMIN') {
    return null
  }
  const [loading, setLoading] = useState(true)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | number | null>(null)
  const [errorAlertOpen, setErrorAlertOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchUsers = async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await getAuthUsers(token)
      setUsers(response.results)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  const handleSaveUser = (userData: any) => {
    // Note: Implementation for saving/updating users via API will be needed here 
    // for full functionality, but for now we follow the user's request to show data.
    if (editingUser) {
      setUsers(
        users.map((user) =>
          user.email === editingUser.email
            ? { ...user, ...userData }
            : user
        )
      )
      setEditingUser(null)
    } else {
      setUsers([
        ...users,
        { ...userData },
      ])
    }
    setUserModalOpen(false)
  }

  const handleDeleteUser = (id: string | number) => {
    setUserToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!token || !userToDelete) return
    try {
      await deleteAuthUser(token, userToDelete.toString())
      await fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      let msg = 'An error occurred while deleting the user.'
      if (typeof error === 'object' && error !== null) {
        if (error.detail) msg = error.detail
      }
      setErrorMessage(msg)
      setErrorAlertOpen(true)
    } finally {
      setDeleteConfirmOpen(false)
      setUserToDelete(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800'
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800'
      case 'USER':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage users and system configurations</p>
        </div>
        <Link href="/dashboard/settings/add-user">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 whitespace-nowrap text-sm sm:text-base px-4 py-2 h-10 sm:h-11 rounded-lg cursor-pointer"
          >
            <Plus size={20} />
            Add User
          </Button>
        </Link>
      </div>

      {/* Users Table - Responsive */}
      <Card className="border-border overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-border bg-secondary">
          <h2 className="font-bold text-foreground text-sm sm:text-base">User Management</h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-secondary hover:bg-secondary">
                  <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Name</TableHead>
                  <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Email</TableHead>
                  <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Phone</TableHead>
                  <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Role</TableHead>
                  <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.email} className="border-border hover:bg-secondary/50 transition-colors">
                      <TableCell className="font-medium text-foreground text-xs sm:text-sm truncate">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm truncate">{user.email}</TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm truncate">{user.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadge(user.role)} text-xs sm:text-sm whitespace-nowrap`}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/settings/edit-user/${user.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border text-primary hover:bg-primary/10 bg-transparent h-9 w-9 p-0 rounded cursor-pointer"
                              title="Edit user"
                            >
                              <Edit size={16} />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-destructive hover:bg-destructive/10 bg-transparent h-9 w-9 p-0 rounded cursor-pointer"
                            title="Delete user"
                            onClick={() => handleDeleteUser(user.id || user.email)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={userModalOpen}
        onClose={() => {
          setUserModalOpen(false)
          setEditingUser(null)
        }}
        onSave={handleSaveUser}
        mode={editingUser ? 'edit' : 'create'}
        initialUser={editingUser ? {
          id: editingUser.email,
          name: `${editingUser.first_name} ${editingUser.last_name}`,
          email: editingUser.email,
          role: editingUser.role.toLowerCase() as any,
          createdAt: new Date().toISOString()
        } : undefined}
      />

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Alert Dialog */}
      <AlertDialog open={errorAlertOpen} onOpenChange={setErrorAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Error</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorAlertOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
