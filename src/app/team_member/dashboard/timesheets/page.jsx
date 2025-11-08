'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Clock, Filter, Search, Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchTimesheets()
  }, [])

  const fetchTimesheets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/timesheets')
      if (!response.ok) throw new Error('Failed to fetch timesheets')
      const data = await response.json()
      setTimesheets(data)
    } catch (error) {
      console.error('Error fetching timesheets:', error)
      toast.error('Failed to load timesheets')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async () => {
    try {
      setExporting(true)
      const response = await fetch('/api/timesheets/export', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to export timesheets')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'timesheets.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Timesheets exported successfully')
    } catch (error) {
      console.error('Error exporting timesheets:', error)
      toast.error('Failed to export timesheets')
    } finally {
      setExporting(false)
    }
  }

  const filteredTimesheets = timesheets.filter(entry =>
    entry.task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalHours = timesheets.reduce((sum, t) => sum + parseFloat(t.hours), 0)
  const totalValue = timesheets.reduce((sum, t) => sum + (parseFloat(t.hours) * parseFloat(t.hourlyRate)), 0)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Timesheets</h1>
          <p className="text-muted-foreground">Log and track time spent on tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={exporting || timesheets.length === 0}>
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button asChild>
            <Link href="/team_member/dashboard/timesheets/create">
              <Plus className="w-4 h-4 mr-2" />
              Log Time
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-card border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Hours</p>
          <p className="text-3xl font-bold">{totalHours.toFixed(2)}h</p>
        </div>
        <div className="bg-card border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Value</p>
          <p className="text-3xl font-bold">${totalValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search timesheets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {filteredTimesheets.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No timesheets found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No timesheets match your search' : 'Start logging your time to see entries here'}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/team_member/dashboard/timesheets/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Time Entry
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">Date</th>
                  <th className="text-left p-4 font-medium text-sm">Project</th>
                  <th className="text-left p-4 font-medium text-sm">Task</th>
                  <th className="text-left p-4 font-medium text-sm">Hours</th>
                  <th className="text-left p-4 font-medium text-sm">Rate</th>
                  <th className="text-left p-4 font-medium text-sm">Value</th>
                  <th className="text-left p-4 font-medium text-sm">Billable</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTimesheets.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/50">
                    <td className="p-4 text-sm">{new Date(entry.workDate).toLocaleDateString()}</td>
                    <td className="p-4 text-sm">{entry.project?.name || '-'}</td>
                    <td className="p-4 text-sm">{entry.task?.title || '-'}</td>
                    <td className="p-4 font-medium text-sm">{parseFloat(entry.hours).toFixed(2)}h</td>
                    <td className="p-4 text-sm">${parseFloat(entry.hourlyRate).toFixed(2)}</td>
                    <td className="p-4 font-semibold text-sm">${(parseFloat(entry.hours) * parseFloat(entry.hourlyRate)).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.isBillable 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {entry.isBillable ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
