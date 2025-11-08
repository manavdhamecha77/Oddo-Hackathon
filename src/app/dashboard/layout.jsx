'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function DashboardRedirectLayout({ children }) {
    const router = useRouter()

    useEffect(() => {
        const redirect = async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' })
                if (res.ok) {
                    const data = await res.json()
                    const role = data.role || 'team_member'
                    router.push(`/${role}/dashboard`)
                } else {
                    router.push('/login')
                }
            } catch (error) {
                router.push('/login')
            }
        }
        redirect()
    }, [router])

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
        </div>
    )
}
