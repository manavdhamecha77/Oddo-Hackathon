"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from 'sonner'

export default function SignUpComponent() {
    const [step, setStep] = useState(1) // 1: Form, 2: OTP
    const [name, setName] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const router = useRouter()

    const handleSendOTP = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!name || !email || !password) {
            setError('Please fill in all required fields')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name })
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess('OTP sent to your email!')
                toast.success('OTP sent to your email!')
                setStep(2)
            } else {
                setError(data.error || 'Failed to send OTP')
                toast.error(data.error || 'Failed to send OTP')
            }
        } catch (err) {
            setError('Network error')
            toast.error('Network error')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!otp || otp.length !== 4) {
            setError('Please enter a valid 4-digit OTP')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, companyName, email, password, otp })
            })

            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Registration failed')
                toast.error(data.error || 'Registration failed')
                setLoading(false)
                return
            }

            const companyId = data.user?.companyId || 'Unknown'
            setSuccess(`Registration successful! Your Company ID: ${companyId}. Redirecting...`)
            toast.success('Registration successful!')
            
            setTimeout(() => {
                router.push('/admin')
            }, 2000)
        } catch (err) {
            setError('Network error')
            toast.error('Network error')
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name })
            })

            if (res.ok) {
                toast.success('OTP resent to your email!')
            } else {
                toast.error('Failed to resend OTP')
            }
        } catch (err) {
            toast.error('Network error')
        } finally {
            setLoading(false)
        }
    }
    return (
        <section
            className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                onSubmit={step === 1 ? handleSendOTP : handleVerifyAndRegister}
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                <div className="p-8 pb-6">
                    <div>
                        <Link href="/" aria-label="go home">
                            <LogoIcon />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">
                            {step === 1 ? 'Create a OneFlow Account' : 'Verify Your Email'}
                        </h1>
                        <p className="text-sm">
                            {step === 1 
                                ? 'Welcome! Create an account to get started' 
                                : `Enter the OTP sent to ${email}`}
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center my-6">
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                                1
                            </div>
                            <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                                2
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Registration Form */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="block text-sm">
                                    Full Name *
                                </Label>
                                <Input 
                                    type="text" 
                                    required 
                                    name="name" 
                                    id="name" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="companyName" className="block text-sm">
                                    Company Name
                                </Label>
                                <Input 
                                    type="text" 
                                    name="companyName" 
                                    id="companyName" 
                                    value={companyName} 
                                    onChange={(e) => setCompanyName(e.target.value)} 
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="block text-sm">
                                    Email *
                                </Label>
                                <Input 
                                    type="email" 
                                    required 
                                    name="email" 
                                    id="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pwd" className="text-sm">
                                    Password *
                                </Label>
                                <Input
                                    type="password"
                                    required
                                    name="pwd"
                                    id="pwd"
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                            </div>

                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </Button>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            {success && <p className="text-sm text-green-500">{success}</p>}
                        </div>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="otp" className="block text-sm text-center">
                                    Enter 4-Digit OTP
                                </Label>
                                <div className="flex justify-center gap-2">
                                    {[0, 1, 2, 3].map((index) => (
                                        <Input
                                            key={index}
                                            type="text"
                                            maxLength={1}
                                            value={otp[index] || ''}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, '')
                                                const newOtp = otp.split('')
                                                newOtp[index] = value
                                                setOtp(newOtp.join(''))
                                                
                                                // Auto-focus next input
                                                if (value && index < 3) {
                                                    const nextInput = e.target.nextElementSibling
                                                    if (nextInput) nextInput.focus()
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                // Handle backspace
                                                if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                                    const prevInput = e.target.previousElementSibling
                                                    if (prevInput) prevInput.focus()
                                                }
                                            }}
                                            className="w-12 h-12 text-center text-xl font-bold"
                                            pattern="[0-9]"
                                            required
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify & Register'}
                            </Button>

                            <div className="text-center space-y-2">
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className="text-sm"
                                >
                                    Resend OTP
                                </Button>
                                <br />
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-muted-foreground"
                                >
                                    Change email address
                                </Button>
                            </div>

                            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                            {success && <p className="text-sm text-green-500 text-center">{success}</p>}
                        </div>
                    )}
                </div>

                <div className="bg-muted rounded-(--radius) border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Have an account ?
                        <Button asChild variant="link" className="px-2">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    );
}
