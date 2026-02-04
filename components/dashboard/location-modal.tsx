'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { X, Edit2 } from 'lucide-react'

interface Location {
  id: string
  name: string
  description: string
}

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (locations: Location[]) => void
  initialLocations: Location[]
  mode: 'create' | 'edit'
}

export function LocationModal({
  isOpen,
  onClose,
  onSave,
  initialLocations,
  mode,
}: LocationModalProps) {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddLocation = () => {
    if (name.trim()) {
      if (editingId) {
        setLocations(
          locations.map((loc) =>
            loc.id === editingId ? { ...loc, name, description } : loc
          )
        )
        setEditingId(null)
      } else {
        setLocations([
          ...locations,
          { id: Date.now().toString(), name, description },
        ])
      }
      setName('')
      setDescription('')
    }
  }

  const handleRemove = (id: string) => {
    setLocations(locations.filter((loc) => loc.id !== id))
  }

  const handleEdit = (location: Location) => {
    setName(location.name)
    setDescription(location.description)
    setEditingId(location.id)
  }

  const handleSave = () => {
    onSave(locations)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Location' : 'Edit Locations'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location List */}
          {locations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Current Locations</h3>
              <div className="space-y-2 mb-4">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between bg-secondary p-3 rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <Badge variant="default" className="mb-1">
                        {location.name}
                      </Badge>
                      {location.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {location.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(location)}
                        className="text-primary hover:bg-primary/10 p-2 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleRemove(location.id)}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add/Edit Location Form */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-sm font-medium text-foreground">
              {editingId ? 'Edit Location' : 'Add New Location'}
            </h3>

            <div className="space-y-2">
              <Label htmlFor="location-name" className="text-foreground">
                Location Name
              </Label>
              <Input
                id="location-name"
                placeholder="e.g., Colosseum"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location-desc" className="text-foreground">
                Description
              </Label>
              <Input
                id="location-desc"
                placeholder="Brief description of the location"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-border"
              />
            </div>

            {/* <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAddLocation}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {editingId ? 'Update Location' : 'Add Location'}
              </Button>
              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    setName('')
                    setDescription('')
                  }}
                  className="border-border"
                >
                  Cancel
                </Button>
              )}
            </div> */}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 border-t border-border pt-6">
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
            {editingId ? 'Update Location' : 'Add Location'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
