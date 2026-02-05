'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Loader2, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createNotice } from '@/app/lib/api'
import { getCookie } from '@/app/lib/cookies'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CreateNoticePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    })

    const [alertConfig, setAlertConfig] = useState<{
        show: boolean;
        title: string;
        message: string;
        type: 'success' | 'error';
        onConfirm?: () => void;
    }>({
        show: false,
        title: '',
        message: '',
        type: 'success'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = getCookie('access_token')
            if (!token) throw new Error('Authentication token not found.')

            await createNotice(token, formData)

            setAlertConfig({
                show: true,
                title: 'Success',
                message: 'Notice created successfully.',
                type: 'success',
                onConfirm: () => router.push('/dashboard/notices')
            })
        } catch (err: any) {
            console.error('Create notice error:', err)
            let errorMessage = 'Failed to create notice. Please try again.'

            if (err) {
                // Handle validation errors from API
                const errorDetails = Object.entries(err).map(([key, value]) => {
                    if (Array.isArray(value)) return `${key}: ${value.join(', ')}`
                    return `${key}: ${value}`
                }).join('\n')
                errorMessage = errorDetails || errorMessage
            }

            setAlertConfig({
                show: true,
                title: 'Error',
                message: errorMessage,
                type: 'error'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto pb-12 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
                <div className="space-y-1">
                    {/* <Link
                        href="/dashboard/notices"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm mb-2 group w-fit"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Notices
                    </Link> */}
                    <div className="flex items-center gap-4">
                        <Link
                        href="/dashboard/notices"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm mb-2 group w-fit"
                    >

                        <Button variant="outline" size="icon" className="border-border bg-transparent cursor-pointer">
            <ChevronLeft size={20} />
          </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Notice</h1>
                    <p className="text-muted-foreground">Publish a new announcement for the system</p>
                    </div>
                    </div>
                </div>
            </div>

            <Card className='p-6 border-border shadow-sm space-y-6'>
                <form onSubmit={handleSubmit} className="space-y-8 mt-8">
                <Card className="p-6 border-border shadow-sm space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-foreground font-semibold">Title</Label>
                            <Input
                                id="title"
                                placeholder="Enter notice title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="bg-transparent border-border focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-foreground font-semibold">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Enter notice description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="min-h-[200px] bg-transparent border-border focus:ring-primary leading-relaxed"
                                required
                            />
                        </div>
                    </div>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 pl-6 py-2">
                    <Link href="/dashboard/notices">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-border text-foreground hover:bg-secondary cursor-pointer h-11 px-6 font-medium"
                        >
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 font-bold shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Create Notice
                            </>
                        )}
                    </Button>
                </div>
            </form>
            </Card>

            {/* Alert Dialog */}
            <AlertDialog
                open={alertConfig.show}
                onOpenChange={(v) => setAlertConfig({ ...alertConfig, show: v })}
            >
                <AlertDialogContent className="max-w-md border-0 bg-background/95 backdrop-blur-lg shadow-2xl">
                    <div className={`absolute top-0 left-0 w-full h-1 ${alertConfig.type === 'success' ? 'bg-primary' : 'bg-destructive'}`} />
                    <AlertDialogHeader>
                        <div className={`flex items-center gap-2 ${alertConfig.type === 'success' ? 'text-primary' : 'text-destructive'} mb-2`}>
                            {alertConfig.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            <AlertDialogTitle className="text-xl font-bold">{alertConfig.title}</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-foreground/80 text-base font-medium whitespace-pre-line">
                            {alertConfig.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => {
                                setAlertConfig({ ...alertConfig, show: false })
                                if (alertConfig.onConfirm) alertConfig.onConfirm()
                            }}
                            className={`cursor-pointer ${alertConfig.type === 'success' ? 'bg-primary hover:bg-primary/90' : 'bg-destructive hover:bg-destructive/90'} text-white border-0 px-8`}
                        >
                            {alertConfig.type === 'success' ? 'Continue' : 'Okay'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
