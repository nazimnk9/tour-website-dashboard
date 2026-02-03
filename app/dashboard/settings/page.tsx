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
import { Plus, Edit, Trash2 } from 'lucide-react'
import { mockUsers } from '@/app/lib/mock-data'
import { UserFormModal } from '@/components/dashboard/user-form-modal'

export default function SettingsPage() {
  const [users, setUsers] = useState(mockUsers)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  const handleSaveUser = (userData: any) => {
    if (editingUserId) {
      setUsers(
        users.map((user) =>
          user.id === editingUserId
            ? { ...user, ...userData }
            : user
        )
      )
      setEditingUserId(null)
    } else {
      setUsers([
        ...users,
        { ...userData, id: Date.now().toString(), createdAt: new Date().toISOString() },
      ])
    }
    setUserModalOpen(false)
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((user) => user.id !== userId))
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'user':
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
        <Button
          onClick={() => {
            setEditingUserId(null)
            setUserModalOpen(true)
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 whitespace-nowrap text-sm sm:text-base px-4 py-2 h-10 sm:h-11 rounded-lg"
        >
          <Plus size={20} />
          Add User
        </Button>
      </div>

      {/* Users Table - Responsive */}
      <Card className="border-border overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-border bg-secondary">
          <h2 className="font-bold text-foreground text-sm sm:text-base">User Management</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-secondary hover:bg-secondary">
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Name</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Email</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Role</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Created</TableHead>
                <TableHead className="text-foreground text-xs sm:text-sm font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-border hover:bg-secondary/50 transition-colors">
                  <TableCell className="font-medium text-foreground text-xs sm:text-sm truncate">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm truncate">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={`${getRoleBadge(user.role)} text-xs sm:text-sm`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-primary hover:bg-primary/10 bg-transparent h-9 w-9 p-0 rounded"
                        title="Edit user"
                        onClick={() => {
                          setEditingUserId(user.id)
                          setUserModalOpen(true)
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-destructive hover:bg-destructive/10 bg-transparent h-9 w-9 p-0 rounded"
                        title="Delete user"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={userModalOpen}
        onClose={() => {
          setUserModalOpen(false)
          setEditingUserId(null)
        }}
        onSave={handleSaveUser}
        mode={editingUserId ? 'edit' : 'create'}
        initialUser={editingUserId ? users.find((u) => u.id === editingUserId) : undefined}
      />
    </div>
  )
}
