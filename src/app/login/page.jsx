"use client"
import { useState } from "react"
import { HeroHeader } from "@/components/header"

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [msg, setMsg] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem("token", data.token)
      window.location.href = "/dashboard"
    } else setMsg(data.error || "Login failed")
  }

  return (
    <>
      <HeroHeader />
      <div className="flex flex-col items-center justify-center min-h-screen" suppressHydrationWarning>
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64" suppressHydrationWarning>
          <input 
            placeholder="Email" 
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            suppressHydrationWarning
          />
          <input 
            placeholder="Password" 
            type="password" 
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            suppressHydrationWarning
          />
          <button className="bg-zinc-800 text-white py-2 rounded" suppressHydrationWarning>
            Login
          </button>
          <p className="text-sm text-gray-500">{msg}</p>
        </form>
      </div>
    </>
  )
}
