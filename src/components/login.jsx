"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function LoginComponent() {
    const [companyId, setCompanyId] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId, email, password }),
                credentials: 'include'
            })

            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Login failed')
                setLoading(false)
                return
            }

            // Cookie is set by backend - no need for localStorage
            // Fetch user role and redirect to role-based dashboard
            const meRes = await fetch('/api/auth/me', { credentials: 'include' })
            if (meRes.ok) {
                const userData = await meRes.json()
                const role = userData.role || 'team_member'
                router.push(`/${role}/dashboard`)
            } else {
                // Fallback to generic dashboard
                router.push('/dashboard')
            }
        } catch (err) {
            setError('Network error')
            setLoading(false)
        }
    }

    return (
        <section
            className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                onSubmit={handleSubmit}
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                <div className="p-8 pb-6">
                    <div>
                        <Link href="/" aria-label="go home">
                            <LogoIcon />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In to OneFlow</h1>
                        <p className="text-sm">Welcome back! Sign in to continue</p>
                    </div>


                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="companyId" className="block text-sm">
                                Company ID
                            </Label>
                            <Input type="text" required name="companyId" id="companyId" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="block text-sm">
                                Email
                            </Label>
                            <Input type="email" required name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pwd" className="text-sm">
                                Password
                            </Label>
                            <Input
                                type="password"
                                required
                                name="pwd"
                                id="pwd"
                                className="input sz-md variant-mixed"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                </div>

                <div className="bg-muted rounded-(--radius) border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Don't have an account ?
                        <Button asChild variant="link" className="px-2">
                            <Link href="/register">Create account</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    );
}
