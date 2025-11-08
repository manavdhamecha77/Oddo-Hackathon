"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { HeroHeader } from "@/components/header"

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", companyName: "", email: "", password: "" })
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      
      if (res.ok) {
        setMsg("Registration successful! Redirecting...")
        // Redirect to admin dashboard after successful registration
        setTimeout(() => {
          router.push("/admin")
        }, 1000)
      } else {
        setMsg(data.error || "Registration failed")
      }
    } catch (error) {
      setMsg("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <HeroHeader />
      <div className="flex flex-col items-center justify-center min-h-screen" suppressHydrationWarning>
        <h1 className="text-2xl font-semibold mb-4">Register as Admin</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64" suppressHydrationWarning>
          <input 
            placeholder="Full Name" 
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            suppressHydrationWarning
          />
          <input 
            placeholder="Company Name" 
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            required
            suppressHydrationWarning
          />
          <input 
            placeholder="Email" 
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            suppressHydrationWarning
          />
          <input 
            placeholder="Password" 
            type="password" 
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
            suppressHydrationWarning
          />
          <button 
            className="bg-zinc-800 text-white py-2 rounded disabled:opacity-50" 
            disabled={loading}
            suppressHydrationWarning
          >
            {loading ? "Registering..." : "Register"}
          </button>
          {msg && (
            <p className={`text-sm ${msg.includes("successful") ? "text-green-600" : "text-red-600"}`}>
              {msg}
            </p>
          )}
        </form>
      </div>
    </>
  )
}
