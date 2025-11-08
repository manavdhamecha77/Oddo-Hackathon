"use client"
import { useState } from "react"

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [msg, setMsg] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) setMsg("Registration successful")
    else setMsg(data.error || "Failed")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
        <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })}/>
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })}/>
        <input placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })}/>
        <button className="bg-zinc-800 text-white py-2 rounded">Register</button>
        <p className="text-sm text-gray-500">{msg}</p>
      </form>
    </div>
  )
}
