'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    ChevronLeft,
    Minus,
    Plus,
    Calendar as CalendarIcon,
    Check,
    Loader2,
    AlertCircle,
    Users,
    Clock,
    Euro,
    Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/app/contexts/auth-context'
import {
    getTourPlans,
    getTourDates,
    getTourTimes,
    createBooking,
    TourPlan,
    TourDate,
    TourTime
} from '@/app/lib/api'
import Link from 'next/link'

import { Calendar } from '@/components/ui/calendar'
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

// Refined DatePicker component to show real calendar
const DatePicker = ({ isOpen, onClose, availableDates, onDateSelect }: any) => {
    if (!isOpen) return null

    const handleSelect = (date: Date | undefined) => {
        if (!date) return

        // Format selected date to YYYY-MM-DD
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`

        // Check if this date is available in the API results
        const availableDate = availableDates.find((d: any) => d.date === dateStr)
        if (availableDate) {
            onDateSelect(availableDate)
            onClose()
        } else {
            alert('This date is not available for the selected tour.')
        }
    }

    return (
        <div className="absolute top-full right-0 mt-2 bg-white border border-border/50 rounded-3xl shadow-2xl p-4 z-1000 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-center mb-4 px-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-primary">Select Manual Date</h4>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-secondary transition-all">
                    <Plus className="rotate-45" size={16} />
                </Button>
            </div>
            <Calendar
                mode="single"
                onSelect={handleSelect}
                //initialFocus
                disabled={(date) => {
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                    return !availableDates.some((d: any) => d.date === dateStr)
                }}
                className="rounded-2xl border-0"
            />
            <div className="mt-4 p-3 bg-secondary/30 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Only highlighted dates are available</p>
            </div>
        </div>
    )
}

export default function NewBookingPage() {
    const router = useRouter()
    const { token } = useAuth()

    // State
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [tourPlans, setTourPlans] = useState<TourPlan[]>([])
    const [selectedTour, setSelectedTour] = useState<TourPlan | null>(null)
    const [availableDates, setAvailableDates] = useState<TourDate[]>([])
    const [selectedDate, setSelectedDate] = useState<TourDate | null>(null)
    const [timeSlots, setTimeSlots] = useState<TourTime[]>([])
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TourTime | null>(null)
    const [counts, setCounts] = useState({
        adults: 1,
        children: 0,
        infants: 0,
        youths: 0,
        students: 0
    })
    const [travelerDetails, setTravelerDetails] = useState<{ name: string; email?: string }[]>([])
    const [step, setStep] = useState(1) // 1: Selection, 2: Details
    const [isGridDatePickerOpen, setIsGridDatePickerOpen] = useState(false)
    const [errorDialogOpen, setErrorDialogOpen] = useState(false)
    const [apiErrors, setApiErrors] = useState<any>(null)
    const gridDatePickerRef = useRef<HTMLDivElement>(null)

    // Fetch initial tour plans
    useEffect(() => {
        const fetchTours = async () => {
            if (!token) return
            try {
                setLoading(true)
                const response = await getTourPlans(token)
                setTourPlans(response.results)
            } catch (err: any) {
                setError('Failed to fetch tour plans')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchTours()
    }, [token])

    // Fetch available dates when tour changes
    useEffect(() => {
        const fetchDates = async () => {
            if (!selectedTour) return
            try {
                const response = await getTourDates(selectedTour.id.toString())
                setAvailableDates(response.results)
                setSelectedDate(null)
                setTimeSlots([])
                setSelectedTimeSlot(null)
            } catch (err) {
                console.error('Error fetching dates:', err)
            }
        }
        fetchDates()
    }, [selectedTour])

    // Fetch time slots when date changes
    useEffect(() => {
        const fetchTimes = async () => {
            if (!selectedDate || !token) return
            try {
                const response = await getTourTimes(token, selectedDate.id.toString())
                setTimeSlots(response.results)
                setSelectedTimeSlot(null)
            } catch (err) {
                console.error('Error fetching times:', err)
            }
        }
        fetchTimes()
    }, [selectedDate, token])

    // Handlers
    const handleTourChange = (id: string) => {
        const tour = tourPlans.find(t => t.id.toString() === id)
        setSelectedTour(tour || null)
        setCounts({ adults: 1, children: 0, infants: 0, youths: 0, students: 0 })
        setError(null)
    }

    const handleUpdateCount = (type: string, delta: number, max: number) => {
        setCounts(prev => {
            const current = (prev as any)[type]
            const newVal = Math.max(type === 'adults' ? 1 : 0, Math.min(max, current + delta))
            return { ...prev, [type]: newVal }
        })
    }

    const handleDateSelect = (date: TourDate) => {
        setSelectedDate(date)
        setIsGridDatePickerOpen(false)
    }

    const handleCreateBooking = () => {
        if (!selectedTour || !selectedTimeSlot) return

        const payload = {
            num_adults: counts.adults,
            num_children: counts.children,
            num_infants: counts.infants,
            num_youth: counts.youths,
            num_student_eu: counts.students,
            tour_plan: selectedTour.id,
            time_slot: selectedTimeSlot.id
        }

        localStorage.setItem('bookNowData', JSON.stringify(payload))

        // Prepare traveler details state
        const totalTravelers = counts.adults + counts.children + counts.infants + counts.youths + counts.students
        setTravelerDetails(Array(totalTravelers).fill({ name: '', email: '' }))
        setStep(2)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleTravelerChange = (index: number, field: string, value: string) => {
        setTravelerDetails(prev => {
            const next = [...prev]
            next[index] = { ...next[index], [field]: value }
            return next
        })
    }

    const handleFinalSubmit = async () => {
        const bookNowData = JSON.parse(localStorage.getItem('bookNowData') || '{}')
        const payload = {
            book_now: "true",
            single_item: bookNowData,
            traveler_details: travelerDetails
        }

        try {
            setSubmitting(true)
            await createBooking(payload, token || undefined)
            localStorage.removeItem('bookNowData')
            router.push('/dashboard/bookings')
        } catch (err: any) {
            console.error('Submit error:', err)
            setApiErrors(err)
            setErrorDialogOpen(true)
        } finally {
            setSubmitting(false)
        }
    }

    // Recursive component to render nested error messages
    const renderErrorMessages = (errors: any) => {
        if (!errors) return []

        return Object.entries(errors).flatMap(([key, value]): any => {
            if (Array.isArray(value)) {
                return value.map((msg, idx) => (
                    <div key={`${key}-${idx}`} className="flex items-start gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <p className="text-sm font-medium text-destructive">
                            <span className="capitalize">{key.replace(/_/g, ' ')}:</span> {msg}
                        </p>
                    </div>
                ))
            } else if (typeof value === 'object' && value !== null) {
                return renderErrorMessages(value)
            }
            return null
        }).filter(Boolean)
    }

    // Next 14 days logic
    const nextDays = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() + i)
        return d
    })

    // Loading Screen
    if (loading && step === 1) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
                <div className="relative h-16 w-16">
                    <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                    <Loader2 className="h-16 w-16 animate-spin text-primary absolute top-0 left-0 [animation-delay:0.2s]" />
                </div>
                {/* <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-widest uppercase">Initializing Dashboard...</p> */}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header Overlay */}
            <div className="bg-white border-b border-border/50 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard/bookings" className="cursor-pointer group flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <ChevronLeft size={18} />
                        </div>
                        Back to Bookings
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-8 max-w-6xl mx-auto pb-32">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-3">
                        <span className="text-primary italic">Manual</span> Booking Engine
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl font-medium">
                        Create institutional reservations and private tour bookings with custom traveler details.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Form Section */}
                    <div className="lg:col-span-8 space-y-10">
                        {step === 1 ? (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* 1. Tour Selection */}
                                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-border/40 transition-hover hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <Info size={20} />
                                        </div>
                                        <h2 className="text-xl font-bold">Select Destination</h2>
                                    </div>

                                    <div className="relative">
                                        <Select
                                            onValueChange={handleTourChange}
                                            value={selectedTour?.id.toString() || ''}
                                        >
                                            <SelectTrigger
                                                hideChevron
                                                wrapContent
                                                className="w-full h-16 appearance-none p-4 bg-secondary/30 border border-border/50 rounded-2xl text-lg font-bold text-foreground focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer pr-12"
                                            >
                                                <SelectValue placeholder="Browse available tour plans..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border border-border/50 rounded-2xl shadow-2xl">
                                                {tourPlans.map(tour => (
                                                    <SelectItem
                                                        key={tour.id}
                                                        value={tour.id.toString()}
                                                        indicatorPlacement="left"
                                                        className="font-medium p-4 gap-4 cursor-pointer focus:bg-accent rounded-xl text-black transition-colors"
                                                    >
                                                        {tour.title} — From €{(parseFloat(tour.price_adult)).toFixed(2)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground z-10">
                                            <Plus className="rotate-0" size={24} />
                                        </div>
                                    </div>
                                </div>

                                {selectedTour && (
                                    <>
                                        {/* 2. Travelers */}
                                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                                    <Users size={20} />
                                                </div>
                                                <h2 className="text-xl font-bold">Group Composition</h2>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {[
                                                    { label: 'Adult', key: 'adults', max: selectedTour.max_adults, age: `${selectedTour.adult_age_min}-${selectedTour.adult_age_max}` },
                                                    { label: 'Child', key: 'children', max: selectedTour.max_children, age: `${selectedTour.child_age_min}-${selectedTour.child_age_max}` },
                                                    { label: 'Infant', key: 'infants', max: selectedTour.max_infants, age: `${selectedTour.infant_age_min}-${selectedTour.infant_age_max}` },
                                                    { label: 'Youth', key: 'youths', max: selectedTour.max_youth, age: `${selectedTour.youth_age_min}-${selectedTour.youth_age_max}` },
                                                    { label: 'Student EU', key: 'students', max: selectedTour.max_student_eu, age: `${selectedTour.student_eu_age_min}-${selectedTour.student_eu_age_max}` }
                                                ].map((item) => (
                                                    item.max > 0 && (
                                                        <div key={item.key} className="p-5 rounded-2xl bg-secondary/20 border border-border/30 flex flex-col gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-foreground">{item.label}</span>
                                                                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-70">Age {item.age}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between bg-white rounded-xl p-2 border border-border/40 shadow-sm">
                                                                <button
                                                                    onClick={() => handleUpdateCount(item.key, -1, item.max)}
                                                                    className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                                                                    disabled={(counts as any)[item.key] <= (item.key === 'adults' ? 1 : 0)}
                                                                >
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className="text-lg font-black tabular-nums">{(counts as any)[item.key]}</span>
                                                                <button
                                                                    onClick={() => handleUpdateCount(item.key, 1, item.max)}
                                                                    className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                                                                    disabled={(counts as any)[item.key] >= item.max}
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>

                                        {/* 3. Date Selection */}
                                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 relative z-20">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                                    <CalendarIcon size={20} />
                                                </div>
                                                <h2 className="text-xl font-bold">Booking Date</h2>
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide flex-1 mask-linear-right">
                                                    {nextDays.map((date, idx) => {
                                                        const year = date.getFullYear();
                                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                                        const day = String(date.getDate()).padStart(2, '0');
                                                        const formattedDate = `${year}-${month}-${day}`;

                                                        const availableDate = availableDates.find(d => d.date === formattedDate)
                                                        const isSelected = selectedDate?.date === formattedDate
                                                        const today = new Date().toISOString().split('T')[0] === formattedDate

                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => { if (availableDate) handleDateSelect(availableDate) }}
                                                                disabled={!availableDate}
                                                                className={`flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group
                                                        ${isSelected
                                                                        ? "border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-105 z-10"
                                                                        : availableDate
                                                                            ? "border-secondary bg-white text-foreground hover:border-primary/50 hover:bg-secondary/20 cursor-pointer shadow-sm"
                                                                            : "border-border/20 bg-secondary/10 text-muted-foreground opacity-40 cursor-not-allowed"
                                                                    }`}
                                                            >
                                                                {today && !isSelected && <div className="absolute top-0 right-0 p-1 bg-primary/10 rounded-bl-lg text-[8px] font-black text-primary uppercase px-2">Now</div>}
                                                                <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                                    {date.toLocaleString('default', { weekday: 'short' })}
                                                                </span>
                                                                <span className="text-2xl font-black tabular-nums leading-none mb-1">
                                                                    {date.getDate()}
                                                                </span>
                                                                <span className="text-[10px] font-bold uppercase opacity-80 group-hover:opacity-100">
                                                                    {date.toLocaleString('default', { month: 'short' })}
                                                                </span>
                                                            </button>
                                                        )
                                                    })}
                                                </div>

                                                <div className="relative pt-0" ref={gridDatePickerRef}>
                                                    <button
                                                        onClick={() => setIsGridDatePickerOpen(!isGridDatePickerOpen)}
                                                        className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-white text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300 shadow-sm cursor-pointer"
                                                    >
                                                        <CalendarIcon size={28} className="mb-1" />
                                                        <span className="text-[10px] font-bold uppercase tracking-tight">Custom</span>
                                                    </button>
                                                    <DatePicker
                                                        isOpen={isGridDatePickerOpen}
                                                        onClose={() => setIsGridDatePickerOpen(false)}
                                                        availableDates={availableDates}
                                                        onDateSelect={handleDateSelect}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 4. Time Selection */}
                                        {selectedDate && (
                                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 relative z-10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                                        <Clock size={20} />
                                                    </div>
                                                    <h2 className="text-xl font-bold">Execution Time</h2>
                                                </div>
                                                <p className="text-sm font-bold text-muted-foreground mb-8 ml-13 italic">
                                                    {new Date(selectedDate.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                                </p>

                                                <div className="flex flex-wrap gap-4">
                                                    {timeSlots.length === 0 ? (
                                                        <div className="flex items-center gap-3 p-6 bg-red-50 rounded-2xl border border-red-100 text-red-600 w-full animate-in zoom-in duration-300">
                                                            <AlertCircle size={20} />
                                                            <span className="text-sm font-bold">All slots are currently booked or unavailable for this date.</span>
                                                        </div>
                                                    ) : (
                                                        timeSlots.map(slot => {
                                                            const isSelected = selectedTimeSlot?.id === slot.id
                                                            return (
                                                                <button
                                                                    key={slot.id}
                                                                    onClick={() => setSelectedTimeSlot(slot)}
                                                                    className={`min-w-[120px] px-8 py-5 rounded-2xl border-2 font-black text-lg transition-all duration-300 tabular-nums cursor-pointer
                                                                ${isSelected
                                                                            ? "bg-foreground text-white border-foreground shadow-2xl scale-110 z-10"
                                                                            : "bg-white text-foreground border-secondary hover:border-foreground/50 hover:bg-secondary/10"
                                                                        }`}
                                                                >
                                                                    {slot.start_time.split(':').slice(0, 2).join(':')}
                                                                </button>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-border/40">
                                    <div className="flex items-center gap-4 mb-12">
                                        <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                                            <Users size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-foreground tracking-tight">Traveler Manifest</h2>
                                            <p className="text-muted-foreground font-medium italic">Please provide legal identification names for the voucher.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {travelerDetails.map((traveler, index) => (
                                            <div key={index} className="group p-8 rounded-[2rem] bg-secondary/10 border border-border/20 transition-all hover:bg-white hover:shadow-xl hover:border-border/80">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-10 h-10 rounded-full bg-white border border-border text-foreground flex items-center justify-center font-black group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                                        {index + 1}
                                                    </div>
                                                    <h3 className="font-black text-sm uppercase tracking-[0.2em] text-muted-foreground opacity-60">Adult {index + 1}</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Full Legal Name</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            placeholder="e.g. MARCUS AURELIUS"
                                                            className="w-full p-4 bg-white border-2 border-secondary rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-lg"
                                                            value={traveler.name}
                                                            onChange={e => handleTravelerChange(index, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    {/* <div className="space-y-2">
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Contact Email (Optional)</label>
                                                        <input
                                                            type="email"
                                                            placeholder="customer@email.com"
                                                            className="w-full p-4 bg-white border-2 border-secondary rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-lg"
                                                            value={traveler.email || ''}
                                                            onChange={e => handleTravelerChange(index, 'email', e.target.value)}
                                                        />
                                                    </div> */}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-16 flex flex-col md:flex-col gap-6">
                                        <Button
                                            variant="outline"
                                            onClick={() => setStep(1)}
                                            className="h-16 flex-1 rounded-2xl border-2 font-black text-sm md:text-lg transition-all hover:scale-[0.98] active:scale-95 cursor-pointer w-full md:w-auto"
                                        >
                                            Review Selection
                                        </Button>
                                        <Button
                                            onClick={handleFinalSubmit}
                                            disabled={submitting || travelerDetails.some(t => !t.name)}
                                            className="h-16 flex-1 rounded-2xl bg-primary text-white font-black text-sm md:text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 cursor-pointer w-full md:w-auto"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" /> : <Check size={24} className="" />}
                                            Generate Booking & Notify
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sticky Sidebar Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <Card className={`overflow-hidden rounded-[2.5rem] border-0 shadow-2xl transition-all duration-500 transform ${selectedTour ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0 pointer-events-none'}`}>
                            <div className="bg-primary p-8 text-white relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Euro size={120} />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-4 opacity-70">Order Intelligence</h3>
                                <p className="text-2xl font-black leading-tight mb-2">{selectedTour?.title}</p>
                                <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                                    <Clock size={12} /> Duration: {selectedTour?.duration_days ? `${selectedTour.duration_days} Days` : 'N/A'}
                                </div>
                            </div>

                            <div className="p-8 space-y-8 bg-white">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start group">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Schedule</span>
                                            <span className="font-black text-lg">
                                                {selectedDate ? new Date(selectedDate.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '---'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Time</span>
                                            <span className="font-black text-lg">
                                                {selectedTimeSlot ? selectedTimeSlot.start_time.split(':').slice(0, 2).join(':') : '---'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-secondary w-full" />

                                    <div className="space-y-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-4">Itemized Breakdown</span>
                                        {[
                                            { label: 'Adults', count: counts.adults, price: selectedTour?.price_adult },
                                            { label: 'Children', count: counts.children, price: selectedTour?.price_child },
                                            { label: 'Infants', count: counts.infants, price: selectedTour?.price_infant },
                                            { label: 'Youths', count: counts.youths, price: selectedTour?.price_youth },
                                            { label: 'Students', count: counts.students, price: selectedTour?.price_student_eu }
                                        ].map((item, i) => (
                                            item.count > 0 && (
                                                <div key={i} className="flex justify-between items-center animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold">{item.count} × {item.label}</span>
                                                        <span className="text-[10px] text-muted-foreground">€{parseFloat(item.price || '0').toFixed(2)} per unit</span>
                                                    </div>
                                                    <span className="font-black">€{(item.count * parseFloat(item.price || '0')).toFixed(2)}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>

                                <div className="relative p-6 pt-10 mt-10 rounded-[2rem] bg-secondary/30 overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                                    <div className="flex flex-col items-end relative z-10">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Gross Total</span>
                                        <span className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                                            €{(
                                                counts.adults * parseFloat(selectedTour?.price_adult || '0') +
                                                counts.children * parseFloat(selectedTour?.price_child || '0') +
                                                counts.infants * parseFloat(selectedTour?.price_infant || '0') +
                                                counts.youths * parseFloat(selectedTour?.price_youth || '0') +
                                                counts.students * parseFloat(selectedTour?.price_student_eu || '0')
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {step === 1 && (
                                    <Button
                                        disabled={!selectedTimeSlot}
                                        onClick={handleCreateBooking}
                                        className="w-full h-16 rounded-[1.5rem] bg-foreground text-white font-black text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-50 cursor-pointer"
                                    >
                                        Continue Order
                                    </Button>
                                )}

                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                                        Secure system booking authenticated via admin token.<br />Review selection before final commit.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <AlertDialogContent className="bg-white rounded-[2rem] border-0 shadow-2xl p-8 max-w-md">
                    <AlertDialogHeader className="mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto sm:mx-0">
                            <AlertCircle size={32} />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-foreground tracking-tight">
                            Booking Conflict
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground font-medium text-base">
                            The system encountered validation errors while processing your reservation.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="bg-secondary/20 rounded-2xl p-6 mb-8 max-h-[300px] overflow-y-auto border border-border/30">
                        {apiErrors ? (
                            <div className="space-y-1">
                                {renderErrorMessages(apiErrors)}
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-destructive">An unexpected error occurred. Please try again.</p>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => setErrorDialogOpen(false)}
                            className="h-14 w-full rounded-xl bg-foreground text-white font-black text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl cursor-pointer"
                        >
                            Acknowledge & Edit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
