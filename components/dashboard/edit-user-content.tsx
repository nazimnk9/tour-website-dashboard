'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft } from 'lucide-react'
import { getAuthUserDetail, updateAuthUser, AuthUser } from '@/app/lib/api'
import { useAuth } from '@/app/contexts/auth-context'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'

export function EditUserContent({ id }: { id: string }) {
    const { token } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [initialData, setInitialData] = useState<AuthUser | null>(null)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
    })

    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean
        title: string
        description: string
        type: 'success' | 'error'
    }>({
        isOpen: false,
        title: '',
        description: '',
        type: 'success',
    })

    useEffect(() => {
        const fetchUser = async () => {
            if (!token || !id) return
            try {
                setLoading(true)
                const user = await getAuthUserDetail(token, id)
                setInitialData(user)
                setFormData({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone || '',
                    password: '', // Password usually shouldn't be populated for security
                })
            } catch (error) {
                console.error('Error fetching user detail:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [token, id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token || !id || !initialData) return

        setUpdating(true)
        try {
            // Create patch data containing only changed fields
            const patchData: any = {}
            if (formData.first_name !== initialData.first_name) patchData.first_name = formData.first_name
            if (formData.last_name !== initialData.last_name) patchData.last_name = formData.last_name
            if (formData.email !== initialData.email) patchData.email = formData.email
            if (formData.phone !== (initialData.phone || '')) patchData.phone = formData.phone
            if (formData.password) patchData.password = formData.password

            if (Object.keys(patchData).length === 0) {
                setUpdating(false)
                router.push('/dashboard/settings')
                return
            }

            await updateAuthUser(token, id, patchData)
            setAlertConfig({
                isOpen: true,
                title: 'Success',
                description: 'User has been updated successfully.',
                type: 'success',
            })
        } catch (error: any) {
            console.error('Error updating user:', error)

            let errorMessage = 'An error occurred while updating the user.'
            if (typeof error === 'object' && error !== null) {
                const errorDetails = Object.entries(error)
                    .map(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            return `${field}: ${messages.join(', ')}`
                        }
                        return null
                    })
                    .filter(Boolean)
                    .join('\n')

                if (errorDetails) {
                    errorMessage = errorDetails
                } else if (error.detail) {
                    errorMessage = error.detail
                }
            }

            setAlertConfig({
                isOpen: true,
                title: 'Error',
                description: errorMessage,
                type: 'error',
            })
        } finally {
            setUpdating(false)
        }
    }

    const handleAlertClose = () => {
        setAlertConfig((prev) => ({ ...prev, isOpen: false }))
        if (alertConfig.type === 'success') {
            router.push('/dashboard/settings')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 sm:space-y-8 pb-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/settings">
                    <Button variant="outline" size="icon" className="h-10 w-10">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Update User</h1>
                    <p className="text-muted-foreground text-sm">Modify existing administrator account</p>
                </div>
            </div>

            <Card className="p-6 border-border shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                name="first_name"
                                placeholder="John"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                name="last_name"
                                placeholder="Doe"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder="+8801XXXXXXXXX"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password (leave blank to keep current)</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={updating}
                        >
                            {updating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update User'
                            )}
                        </Button>
                        <Link href="/dashboard/settings" className="flex-1">
                            <Button type="button" variant="outline" className="w-full">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </Card>

            <AlertDialog open={alertConfig.isOpen} onOpenChange={(open) => !open && handleAlertClose()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className={alertConfig.type === 'error' ? 'text-destructive' : 'text-primary'}>
                            {alertConfig.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="whitespace-pre-line">
                            {alertConfig.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleAlertClose}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
