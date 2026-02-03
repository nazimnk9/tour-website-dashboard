'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'user'
  createdAt: string
}

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: any) => void
  mode: 'create' | 'edit'
  initialUser?: User
}

export function UserFormModal({
  isOpen,
  onClose,
  onSave,
  mode,
  initialUser,
}: UserFormModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'manager' | 'user'>('user')

  useEffect(() => {
    if (initialUser && mode === 'edit') {
      setName(initialUser.name)
      setEmail(initialUser.email)
      setRole(initialUser.role)
    } else {
      setName('')
      setEmail('')
      setRole('user')
    }
  }, [initialUser, mode, isOpen])

  const handleSave = () => {
    if (name.trim() && email.trim()) {
      onSave({ name, email, role })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New User' : 'Edit User'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="user-name" className="text-foreground">
              Full Name
            </Label>
            <Input
              id="user-name"
              placeholder="Enter user name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-border"
            />
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="user-email" className="text-foreground">
              Email Address
            </Label>
            <Input
              id="user-email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-border"
            />
          </div>

          {/* Role Select */}
          <div className="space-y-2">
            <Label htmlFor="user-role" className="text-foreground">
              Role
            </Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger id="user-role" className="border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
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
            {mode === 'create' ? 'Create User' : 'Update User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
