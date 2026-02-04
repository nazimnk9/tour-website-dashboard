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
    AlertCircle
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
import { createTourPlan, ApiErrorResponse } from '@/app/lib/api'
import { getCookie } from '@/app/lib/cookies'

export default function CreateTourPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; title: string; message: string }>({
        isOpen: false,
        title: '',
        message: ''
    })
    const [successDialogOpen, setSuccessDialogOpen] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        full_description: '',
        max_adults: 1,
        price_adult: '0.00',
        adult_age_min: 18,
        adult_age_max: 99,
        max_children: 0,
        price_child: '0.00',
        child_age_min: 3,
        child_age_max: 12,
        max_infants: 0,
        price_infant: '0.00',
        infant_age_min: 0,
        infant_age_max: 2,
        max_youth: 0,
        price_youth: '0.00',
        youth_age_min: 13,
        youth_age_max: 17,
        max_student_eu: 0,
        price_student_eu: '0.00',
        student_eu_age_min: 18,
        student_eu_age_max: 26,
        free_cancellation: true,
        pickup_included: false,
        duration_days: 1,
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

            const payload = {
                ...formData,
                highlights,
                includes,
                excludes,
                not_suitable_for: notSuitableFor,
                not_allowed: notAllowed,
                know_before_you_go: knowBeforeYouGo,
            }

            await createTourPlan(token, payload)
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
                        className="border-border hover:bg-primary/10"
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

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/tours">
                        <Button variant="outline" size="icon" className="border-border bg-transparent hover:bg-secondary">
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
                    </Card>

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
                                            value={formData.max_adults}
                                            onChange={e => setFormData({ ...formData, max_adults: parseInt(e.target.value) })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Price ($)</Label>
                                        <Input
                                            type="text"
                                            value={formData.price_adult}
                                            onChange={e => setFormData({ ...formData, price_adult: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Min Age</Label>
                                        <Input
                                            type="number"
                                            value={formData.adult_age_min}
                                            onChange={e => setFormData({ ...formData, adult_age_min: parseInt(e.target.value) })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Age</Label>
                                        <Input
                                            type="number"
                                            value={formData.adult_age_max}
                                            onChange={e => setFormData({ ...formData, adult_age_max: parseInt(e.target.value) })}
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
                                            value={formData.max_children}
                                            onChange={e => setFormData({ ...formData, max_children: parseInt(e.target.value) })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Price ($)</Label>
                                        <Input type="text"
                                            value={formData.price_child}
                                            onChange={e => setFormData({ ...formData, price_child: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Min Age</Label>
                                        <Input type="number"
                                            value={formData.child_age_min}
                                            onChange={e => setFormData({ ...formData, child_age_min: parseInt(e.target.value) })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Age</Label>
                                        <Input type="number"
                                            value={formData.child_age_max}
                                            onChange={e => setFormData({ ...formData, child_age_max: parseInt(e.target.value) })}
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
                                            value={formData.max_infants}
                                            onChange={e => setFormData({ ...formData, max_infants: parseInt(e.target.value) })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Price ($)</Label>
                                        <Input type="text"
                                            value={formData.price_infant}
                                            onChange={e => setFormData({ ...formData, price_infant: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Min Age</Label>
                                        <Input type="number"
                                            value={formData.infant_age_min}
                                            onChange={e => setFormData({ ...formData, infant_age_min: parseInt(e.target.value) })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Age</Label>
                                        <Input type="number"
                                            value={formData.infant_age_max}
                                            onChange={e => setFormData({ ...formData, infant_age_max: parseInt(e.target.value) })}
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
                                            value={formData.max_youth}
                                            onChange={e => setFormData({ ...formData, max_youth: parseInt(e.target.value) })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Price ($)</Label>
                                        <Input type="text"
                                            value={formData.price_youth}
                                            onChange={e => setFormData({ ...formData, price_youth: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Min Age</Label>
                                        <Input type="number"
                                            value={formData.youth_age_min}
                                            onChange={e => setFormData({ ...formData, youth_age_min: parseInt(e.target.value) })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Age</Label>
                                        <Input type="number"
                                            value={formData.youth_age_max}
                                            onChange={e => setFormData({ ...formData, youth_age_max: parseInt(e.target.value) })}
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
                                            value={formData.max_student_eu}
                                            onChange={e => setFormData({ ...formData, max_student_eu: parseInt(e.target.value) })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Price ($)</Label>
                                        <Input type="text"
                                            value={formData.price_student_eu}
                                            onChange={e => setFormData({ ...formData, price_student_eu: e.target.value })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Min Age</Label>
                                        <Input type="number"
                                            value={formData.student_eu_age_min}
                                            onChange={e => setFormData({ ...formData, student_eu_age_min: parseInt(e.target.value) })}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Max Age</Label>
                                        <Input type="number"
                                            value={formData.student_eu_age_max}
                                            onChange={e => setFormData({ ...formData, student_eu_age_max: parseInt(e.target.value) })}
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
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Duration (Days)</Label>
                                <Input
                                    type="number"
                                    value={formData.duration_days}
                                    onChange={e => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
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
                    <Button variant="outline" className="w-full border-border bg-transparent flex items-center gap-2 px-6 h-11">
                        <History size={18} />
                        Back
                    </Button>
                </Link>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 sm:flex-initial bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 px-8 h-11"
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
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-white border-0">
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
                            className="bg-primary hover:bg-primary/90 text-primary-foreground border-0"
                        >
                            Back to Tours
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
