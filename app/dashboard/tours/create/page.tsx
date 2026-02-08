'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft,
    Plus,
    Save,
    Trash2,
    Info,
    CheckCircle2,
    XSquare,
    History,
    Loader2,
    AlertCircle,
    ImagePlus,
    X,
    MapPin,
    Edit2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createTourPlan, ApiErrorResponse, uploadTourImage, deleteTourImage, TourImage, TourLocation, createTourLocation, updateTourLocation, deleteTourLocation } from '@/app/lib/api'
import { getCookie } from '@/app/lib/cookies'
import { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export default function CreateTourPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; title: string; message: string }>({
        isOpen: false,
        title: '',
        message: ''
    })
    const [successDialogOpen, setSuccessDialogOpen] = useState(false)

    // Image Upload State
    const [uploadedImages, setUploadedImages] = useState<TourImage[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [deletingImageId, setDeletingImageId] = useState<number | null>(null)

    // Location State
    const [uploadedLocations, setUploadedLocations] = useState<TourLocation[]>([])
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
    const [isProcessingLocation, setIsProcessingLocation] = useState(false)
    const [deletingLocationId, setDeletingLocationId] = useState<number | null>(null)
    const [editingLocation, setEditingLocation] = useState<TourLocation | null>(null)
    const [locationForm, setLocationForm] = useState({ name: '', description: '' })

    // Sync with local storage on mount
    useEffect(() => {
        const savedImages = localStorage.getItem('tour_uploaded_images')
        if (savedImages) {
            try {
                setUploadedImages(JSON.parse(savedImages))
            } catch (e) {
                console.error("Failed to parse saved images", e)
            }
        }

        const savedLocations = localStorage.getItem('tour_uploaded_locations')
        if (savedLocations) {
            try {
                setUploadedLocations(JSON.parse(savedLocations))
            } catch (e) {
                console.error("Failed to parse saved locations", e)
            }
        }
    }, [])

    const updateLocalStorage = (images: TourImage[]) => {
        localStorage.setItem('tour_uploaded_images', JSON.stringify(images))
    }

    const updateLocationLocalStorage = (locations: TourLocation[]) => {
        localStorage.setItem('tour_uploaded_locations', JSON.stringify(locations))
    }

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        full_description: '',
        max_adults: '' as any,
        price_adult: '',
        adult_age_min: '' as any,
        adult_age_max: '' as any,
        max_children: '' as any,
        price_child: '',
        child_age_min: '' as any,
        child_age_max: '' as any,
        max_infants: '' as any,
        price_infant: '',
        infant_age_min: '' as any,
        infant_age_max: '' as any,
        max_youth: '' as any,
        price_youth: '',
        youth_age_min: '' as any,
        youth_age_max: '' as any,
        max_student_eu: '' as any,
        price_student_eu: '',
        student_eu_age_min: '' as any,
        student_eu_age_max: '' as any,
        free_cancellation: true,
        pickup_included: false,
        duration_days: '' as any,
        //status: 'Draft',
        is_active: true,
    })

    // Array states
    const [highlights, setHighlights] = useState<string[]>([])
    const [includes, setIncludes] = useState<string[]>([])
    const [excludes, setExcludes] = useState<string[]>([])
    const [notSuitableFor, setNotSuitableFor] = useState<string[]>([])
    const [notAllowed, setNotAllowed] = useState<string[]>([])
    const [knowBeforeYouGo, setKnowBeforeYouGo] = useState<string[]>([])

    // Helper for adding to arrays
    const addToArray = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        if (value.trim()) {
            setter(prev => [...prev, value.trim()])
        }
    }

    // Helper for removing from arrays
    const removeFromArray = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        setter(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = getCookie('access_token')
            if (!token) {
                throw new Error('No authentication token found.')
            }

            const parseNumber = (val: any) => (val === '' || val === null || val === undefined) ? 0 : Number(val)

            const payload = {
                ...formData,
                max_adults: parseNumber(formData.max_adults),
                adult_age_min: parseNumber(formData.adult_age_min),
                adult_age_max: parseNumber(formData.adult_age_max),
                max_children: parseNumber(formData.max_children),
                child_age_min: parseNumber(formData.child_age_min),
                child_age_max: parseNumber(formData.child_age_max),
                max_infants: parseNumber(formData.max_infants),
                infant_age_min: parseNumber(formData.infant_age_min),
                infant_age_max: parseNumber(formData.infant_age_max),
                max_youth: parseNumber(formData.max_youth),
                youth_age_min: parseNumber(formData.youth_age_min),
                youth_age_max: parseNumber(formData.youth_age_max),
                max_student_eu: parseNumber(formData.max_student_eu),
                student_eu_age_min: parseNumber(formData.student_eu_age_min),
                student_eu_age_max: parseNumber(formData.student_eu_age_max),
                duration_days: parseNumber(formData.duration_days),
                highlights,
                includes,
                excludes,
                not_suitable_for: notSuitableFor,
                not_allowed: notAllowed,
                know_before_you_go: knowBeforeYouGo,
                image_ids: uploadedImages.map(img => img.id),
                location_ids: uploadedLocations.map(loc => loc.id)
            }

            await createTourPlan(token, payload)
            localStorage.removeItem('tour_uploaded_images')
            localStorage.removeItem('tour_uploaded_locations')
            setSuccessDialogOpen(true)
        } catch (err: any) {
            console.error('Create tour error:', err)
            let title = 'Error Creating Tour'
            let message = 'An unexpected error occurred. Please try again.'

            if (err.detail) {
                message = Array.isArray(err.detail) ? err.detail.join('\n') : err.detail
            } else if (typeof err === 'object') {
                const errorDetails = Object.entries(err)
                    .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                    .join('\n')
                message = errorDetails || message
            }

            setErrorDialog({
                isOpen: true,
                title,
                message
            })
        } finally {
            setIsLoading(false)
        }
    }

    const ArrayField = ({
        label,
        items,
        setter,
        placeholder,
        icon: Icon
    }: {
        label: string;
        items: string[];
        setter: React.Dispatch<React.SetStateAction<string[]>>;
        placeholder: string;
        icon: any;
    }) => {
        const [tempValue, setTempValue] = useState('')
        return (
            <Card className="p-4 border-border bg-card/50 backdrop-blur-sm shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <Icon size={18} />
                    <Label className="text-foreground">{label}</Label>
                </div>
                <div className="flex gap-2">
                    <Input
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        placeholder={placeholder}
                        className="border-border focus:ring-primary"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addToArray(setter, tempValue)
                                setTempValue('')
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            addToArray(setter, tempValue)
                            setTempValue('')
                        }}
                        className="border-border hover:bg-primary/10 cursor-pointer"
                    >
                        <Plus size={18} />
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {items.map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                            {item}
                            <button onClick={() => removeFromArray(setter, idx)} className="hover:text-destructive">
                                <Trash2 size={12} />
                            </button>
                        </Badge>
                    ))}
                </div>
            </Card>
        )
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const token = getCookie('access_token')
        if (!token) {
            setErrorDialog({
                isOpen: true,
                title: 'Authentication Error',
                message: 'No authentication token found. Please log in again.'
            })
            return
        }

        setIsUploading(true)
        const newUploadedImages = [...uploadedImages]

        try {
            for (let i = 0; i < files.length; i++) {
                const img = await uploadTourImage(token, files[i])
                newUploadedImages.push(img)
            }
            setUploadedImages(newUploadedImages)
            updateLocalStorage(newUploadedImages)
        } catch (err: any) {
            setErrorDialog({
                isOpen: true,
                title: 'Upload Error',
                message: err.detail || 'Failed to upload one or more images.'
            })
        } finally {
            setIsUploading(false)
            // Clear input
            e.target.value = ''
        }
    }

    const handleImageDelete = async (id: number) => {
        const token = getCookie('access_token')
        if (!token) return

        setDeletingImageId(id)
        try {
            await deleteTourImage(token, id)
            const filteredImages = uploadedImages.filter(img => img.id !== id)
            setUploadedImages(filteredImages)
            updateLocalStorage(filteredImages)
        } catch (err: any) {
            setErrorDialog({
                isOpen: true,
                title: 'Delete Error',
                message: 'Failed to delete image from the server.'
            })
        } finally {
            setDeletingImageId(null)
        }
    }

    const handleLocationSave = async () => {
        if (!locationForm.name.trim()) return

        const token = getCookie('access_token')
        if (!token) return

        setIsProcessingLocation(true)
        try {
            if (editingLocation) {
                const updated = await updateTourLocation(token, editingLocation.id, locationForm)
                const newLocations = uploadedLocations.map(loc => loc.id === updated.id ? updated : loc)
                setUploadedLocations(newLocations)
                updateLocationLocalStorage(newLocations)
            } else {
                const created = await createTourLocation(token, locationForm)
                const newLocations = [...uploadedLocations, created]
                setUploadedLocations(newLocations)
                updateLocationLocalStorage(newLocations)
            }
            setIsLocationModalOpen(false)
            setEditingLocation(null)
            setLocationForm({ name: '', description: '' })
        } catch (err: any) {
            setErrorDialog({
                isOpen: true,
                title: 'Location Error',
                message: err.name ? `Name: ${err.name[0]}` : 'Failed to save location.'
            })
        } finally {
            setIsProcessingLocation(false)
        }
    }

    const handleLocationDelete = async (id: number) => {
        const token = getCookie('access_token')
        if (!token) return

        setDeletingLocationId(id)
        try {
            await deleteTourLocation(token, id)
            const filteredLocations = uploadedLocations.filter(loc => loc.id !== id)
            setUploadedLocations(filteredLocations)
            updateLocationLocalStorage(filteredLocations)
        } catch (err: any) {
            setErrorDialog({
                isOpen: true,
                title: 'Delete Error',
                message: 'Failed to delete location from the server.'
            })
        } finally {
            setDeletingLocationId(null)
        }
    }

    const openEditLocation = (loc: TourLocation) => {
        setEditingLocation(loc)
        setLocationForm({ name: loc.name, description: loc.description })
        setIsLocationModalOpen(true)
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/tours">
                        <Button variant="outline" size="icon" className="cursor-pointer border-border bg-transparent hover:bg-secondary">
                            <ChevronLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Create New Tour</h1>
                        <p className="text-muted-foreground">Fill in the details to publish a new tour offering</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Columns - Base Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 border-border shadow-lg space-y-6 bg-card/40 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Info className="text-primary" size={20} />
                            Basic Information
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Tour Title</Label>
                                <Input
                                    id="title"
                                    required
                                    placeholder="e.g. Rome: Colosseum & Roman Forum Tour"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="border-border text-lg font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Short Description</Label>
                                <Textarea
                                    id="description"
                                    required
                                    placeholder="Provide a brief summary of the tour"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="border-border min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="full_description">Full Description</Label>
                                <Textarea
                                    id="full_description"
                                    placeholder="Describe the tour in detail (historical context, itinerary, etc.)"
                                    value={formData.full_description}
                                    onChange={e => setFormData({ ...formData, full_description: e.target.value })}
                                    className="border-border min-h-[200px]"
                                />
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-4 pt-4">
                            <Label className="text-lg font-bold flex items-center gap-2">
                                <ImagePlus className="text-primary" size={20} />
                                Tour Images
                            </Label>
                            <Card className="p-6 border-dashed border-2 border-border bg-card/20 hover:bg-card/30 transition-colors">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="p-4 bg-primary/10 rounded-full">
                                        {isUploading ? <Loader2 className="animate-spin text-primary" size={32} /> : <ImagePlus className="text-primary" size={32} />}
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold">{isUploading ? 'Uploading...' : 'Upload Tour Images'}</p>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (Max 5MB each)</p>
                                    </div>
                                    <Input
                                        id="image-upload"
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                        accept="image/*"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                        disabled={isUploading}
                                        className="border-primary text-primary hover:bg-primary/10"
                                    >
                                        {isUploading ? 'Please wait...' : 'Select Images'}
                                    </Button>
                                </div>
                            </Card>

                            {/* Image Previews */}
                            {uploadedImages.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                    {uploadedImages.map((img) => (
                                        <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary shadow-sm">
                                            <img
                                                src={img.file}
                                                alt="Tour preview"
                                                className="w-full h-full object-fixed transition-transform group-hover:scale-105"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleImageDelete(img.id)}
                                                disabled={deletingImageId === img.id}
                                                className={`cursor-pointer absolute top-2 right-2 p-1.5 bg-destructive/90 text-white rounded-full opacity-100 transition-opacity shadow-lg hover:bg-destructive ${deletingImageId === img.id ? 'cursor-not-allowed' : ''}`}
                                            >
                                                {deletingImageId === img.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <X size={14} />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Location Section */}
                        <div className="space-y-4 pt-6 border-t border-border">
                            <div className="flex items-center justify-between">
                                <Label className="text-lg font-bold flex items-center gap-2">
                                    <MapPin className="text-primary" size={20} />
                                    Tour Locations
                                </Label>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setEditingLocation(null)
                                        setLocationForm({ name: '', description: '' })
                                        setIsLocationModalOpen(true)
                                    }}
                                    className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8"
                                >
                                    <Plus className="mr-1" size={14} />
                                    Add Location
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {uploadedLocations.length > 0 ? (
                                    uploadedLocations.map((loc) => (
                                        <Card key={loc.id} className="flex items-center justify-between p-3 bg-secondary/50 border-border group">
                                            <div className="flex-1">
                                                <Badge className="mb-1 bg-primary/20 text-primary hover:bg-primary/30 border-none">{loc.name}</Badge>
                                                <p className="text-xs text-muted-foreground line-clamp-1">{loc.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditLocation(loc)}
                                                    className="cursor-pointer h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={deletingLocationId === loc.id}
                                                    onClick={() => handleLocationDelete(loc.id)}
                                                    className="cursor-pointer h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    {deletingLocationId === loc.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <X size={14} />
                                                    )}
                                                </Button>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-6 border-2 border-dashed border-border rounded-lg bg-card/20 text-muted-foreground text-sm">
                                        No locations added yet. Click "Add Location" to start.
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Location Modal */}
                    <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
                        <DialogContent className="max-w-md border-primary/20 bg-background/95 backdrop-blur-lg">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-primary font-bold">
                                    <MapPin size={20} />
                                    {editingLocation ? 'Update Location' : 'Add New Location'}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loc-name">Location Name</Label>
                                    <Input
                                        id="loc-name"
                                        placeholder="e.g. History Museum"
                                        value={locationForm.name}
                                        onChange={e => setLocationForm({ ...locationForm, name: e.target.value })}
                                        className="border-border bg-background"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loc-desc">Description</Label>
                                    <Textarea
                                        id="loc-desc"
                                        placeholder="Short details about this location..."
                                        value={locationForm.description}
                                        onChange={e => setLocationForm({ ...locationForm, description: e.target.value })}
                                        className="border-border bg-background min-h-[100px]"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsLocationModalOpen(false)}
                                    className="cursor-pointer border-border hover:bg-secondary"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleLocationSave}
                                    disabled={isProcessingLocation || !locationForm.name.trim()}
                                    className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]"
                                >
                                    {isProcessingLocation ? <Loader2 size={16} className="animate-spin" /> : (editingLocation ? 'Update' : 'Add Location')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Pricing Sections */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-foreground px-2">Pricing & Age Groups</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Adults */}
                            <Card className="p-4 border-primary/20 bg-primary/5 shadow-sm space-y-4">
                                <h3 className="font-bold text-primary flex items-center justify-between">
                                    Adults
                                    <Badge variant="outline" className="border-primary/30 text-primary">Required</Badge>
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Adults</Label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 1"
                                            value={formData.max_adults}
                                            onChange={e => setFormData({ ...formData, max_adults: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Price ($)</Label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. 0.00"
                                            value={formData.price_adult}
                                            onChange={e => setFormData({ ...formData, price_adult: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Min Age</Label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 18"
                                            value={formData.adult_age_min}
                                            onChange={e => setFormData({ ...formData, adult_age_min: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Age</Label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 99"
                                            value={formData.adult_age_max}
                                            onChange={e => setFormData({ ...formData, adult_age_max: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Children */}
                            <Card className="p-4 border-border bg-card/50 shadow-sm space-y-4">
                                <h3 className="font-bold text-foreground">Children</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Children</Label>
                                        <Input type="number"
                                            placeholder="e.g. 0"
                                            value={formData.max_children}
                                            onChange={e => setFormData({ ...formData, max_children: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Price ($)</Label>
                                        <Input type="text"
                                            placeholder="e.g. 0.00"
                                            value={formData.price_child}
                                            onChange={e => setFormData({ ...formData, price_child: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Min Age</Label>
                                        <Input type="number"
                                            placeholder="e.g. 3"
                                            value={formData.child_age_min}
                                            onChange={e => setFormData({ ...formData, child_age_min: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Age</Label>
                                        <Input type="number"
                                            placeholder="e.g. 12"
                                            value={formData.child_age_max}
                                            onChange={e => setFormData({ ...formData, child_age_max: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Infants */}
                            <Card className="p-4 border-border bg-card/50 shadow-sm space-y-4">
                                <h3 className="font-bold text-foreground">Infants</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Infants</Label>
                                        <Input type="number"
                                            placeholder="e.g. 0"
                                            value={formData.max_infants}
                                            onChange={e => setFormData({ ...formData, max_infants: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Price ($)</Label>
                                        <Input type="text"
                                            placeholder="e.g. 0.00"
                                            value={formData.price_infant}
                                            onChange={e => setFormData({ ...formData, price_infant: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Min Age</Label>
                                        <Input type="number"
                                            placeholder="e.g. 0"
                                            value={formData.infant_age_min}
                                            onChange={e => setFormData({ ...formData, infant_age_min: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Age</Label>
                                        <Input type="number"
                                            placeholder="e.g. 2"
                                            value={formData.infant_age_max}
                                            onChange={e => setFormData({ ...formData, infant_age_max: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Youth */}
                            <Card className="p-4 border-border bg-card/50 shadow-sm space-y-4">
                                <h3 className="font-bold text-foreground">Youth</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Youth</Label>
                                        <Input type="number"
                                            placeholder="e.g. 0"
                                            value={formData.max_youth}
                                            onChange={e => setFormData({ ...formData, max_youth: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Price ($)</Label>
                                        <Input type="text"
                                            placeholder="e.g. 0.00"
                                            value={formData.price_youth}
                                            onChange={e => setFormData({ ...formData, price_youth: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Min Age</Label>
                                        <Input type="number"
                                            placeholder="e.g. 13"
                                            value={formData.youth_age_min}
                                            onChange={e => setFormData({ ...formData, youth_age_min: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Age</Label>
                                        <Input type="number"
                                            placeholder="e.g. 17"
                                            value={formData.youth_age_max}
                                            onChange={e => setFormData({ ...formData, youth_age_max: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* EU Students */}
                            <Card className="p-4 border-border bg-card/50 shadow-sm space-y-4">
                                <h3 className="font-bold text-foreground">Students (EU)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Students</Label>
                                        <Input type="number"
                                            placeholder="e.g. 0"
                                            value={formData.max_student_eu}
                                            onChange={e => setFormData({ ...formData, max_student_eu: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Price ($)</Label>
                                        <Input type="text"
                                            placeholder="e.g. 0.00"
                                            value={formData.price_student_eu}
                                            onChange={e => setFormData({ ...formData, price_student_eu: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Min Age</Label>
                                        <Input type="number"
                                            placeholder="e.g. 18"
                                            value={formData.student_eu_age_min}
                                            onChange={e => setFormData({ ...formData, student_eu_age_min: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Age</Label>
                                        <Input type="number"
                                            placeholder="e.g. 26"
                                            value={formData.student_eu_age_max}
                                            onChange={e => setFormData({ ...formData, student_eu_age_max: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Right Column - Status, Metadata & Lists */}
                <div className="space-y-6">
                    <Card className="p-6 border-border shadow-lg space-y-6 bg-card/60 backdrop-blur-md sticky top-6">
                        <h2 className="text-xl font-bold text-foreground">Tour Status</h2>

                        <div className="space-y-4">
                            {/* <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                                >
                                    <SelectTrigger className="border-border bg-background">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Published">Published</SelectItem>
                                        <SelectItem value="Archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div> */}

                            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label>Active Status</Label>
                                    <p className="text-xs text-muted-foreground">Visible on website</p>
                                </div>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                                    className='cursor-pointer'
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label>Free Cancellation</Label>
                                    <p className="text-xs text-muted-foreground">Allow full refund</p>
                                </div>
                                <Switch
                                    checked={formData.free_cancellation}
                                    onCheckedChange={(v) => setFormData({ ...formData, free_cancellation: v })}
                                    className='cursor-pointer'
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label>Pickup Included</Label>
                                    <p className="text-xs text-muted-foreground">Hotel pickup availability</p>
                                </div>
                                <Switch
                                    checked={formData.pickup_included}
                                    onCheckedChange={(v) => setFormData({ ...formData, pickup_included: v })}
                                    className='cursor-pointer'
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Duration (Days)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 1"
                                    value={formData.duration_days}
                                    onChange={e => setFormData({ ...formData, duration_days: e.target.value })}
                                    className="border-border bg-background"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border">
                            <ArrayField
                                label="Highlights"
                                items={highlights}
                                setter={setHighlights}
                                placeholder="e.g. Skip-the-line access"
                                icon={CheckCircle2}
                            />
                            <ArrayField
                                label="Includes"
                                items={includes}
                                setter={setIncludes}
                                placeholder="e.g. Professional guide"
                                icon={Plus}
                            />
                            <ArrayField
                                label="Excludes"
                                items={excludes}
                                setter={setExcludes}
                                placeholder="e.g. Gratuities"
                                icon={Trash2}
                            />
                            <ArrayField
                                label="Know Before You Go"
                                items={knowBeforeYouGo}
                                setter={setKnowBeforeYouGo}
                                placeholder="e.g. Wear comfortable shoes"
                                icon={Info}
                            />
                            <ArrayField
                                label="Not Suitable For"
                                items={notSuitableFor}
                                setter={setNotSuitableFor}
                                placeholder="e.g. Wheelchair users"
                                icon={XSquare}
                            />
                            <ArrayField
                                label="Not Allowed"
                                items={notAllowed}
                                setter={setNotAllowed}
                                placeholder="e.g. Large bags"
                                icon={AlertCircle}
                            />
                        </div>
                    </Card>
                </div>
            </form>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-border">
                <Link href="/dashboard/tours" className="flex-1 sm:flex-initial">
                    <Button variant="outline" className="cursor-pointer w-full border-border bg-transparent flex items-center gap-2 px-6 h-11">
                        <History size={18} />
                        Back
                    </Button>
                </Link>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="cursor-pointer flex-1 sm:flex-initial bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 px-8 h-11"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Create
                </Button>
            </div>

            {/* Error Dialog */}
            <AlertDialog
                open={errorDialog.isOpen}
                onOpenChange={(v) => setErrorDialog({ ...errorDialog, isOpen: v })}
            >
                <AlertDialogContent className="max-w-md border-destructive/20 bg-background/95 backdrop-blur-lg">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-destructive mb-2">
                            <AlertCircle size={24} />
                            <AlertDialogTitle>{errorDialog.title}</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-foreground/80 whitespace-pre-line font-medium">
                            {errorDialog.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="cursor-pointer bg-destructive hover:bg-destructive/90 text-white border-0">
                            Okay, I'll fix it
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Success Dialog */}
            <AlertDialog
                open={successDialogOpen}
                onOpenChange={setSuccessDialogOpen}
            >
                <AlertDialogContent className="max-w-md border-primary/20 bg-background/95 backdrop-blur-lg">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <CheckCircle2 size={24} />
                            <AlertDialogTitle>Success!</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-foreground/80 font-medium">
                            Your new tour has been created successfully and is now live.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => router.push('/dashboard/tours')}
                            className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground border-0"
                        >
                            Back to Tours
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
