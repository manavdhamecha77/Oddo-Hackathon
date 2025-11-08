'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CreateExpensePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    project: '',
    description: '',
    amount: '',
    date: '',
    category: 'Travel',
    receipt: null
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Creating expense:', formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/dashboard/expenses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Expenses
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Submit Expense</h1>
        <p className="text-muted-foreground">Create a new expense record</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-card border rounded-xl p-6 space-y-6">
          <div>
            <label htmlFor="project" className="block text-sm font-medium mb-2">
              Project *
            </label>
            <select
              id="project"
              name="project"
              required
              value={formData.project}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg bg-background"
            >
              <option value="">Select a project</option>
              <option value="1">Website Redesign</option>
              <option value="2">Mobile App Development</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg bg-background"
              placeholder="What was this expense for?"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-2">
                Amount *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-background"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-background"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg bg-background"
            >
              <option value="Travel">Travel</option>
              <option value="Software">Software</option>
              <option value="Materials">Materials</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="receipt" className="block text-sm font-medium mb-2">
              Receipt
            </label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
              <input type="file" className="hidden" id="receipt" accept="image/*,application/pdf" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Submit Expense
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
