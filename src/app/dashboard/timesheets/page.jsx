'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Plus, Clock, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TimesheetsPage() {
  const timesheets = [
    { id: 1, project: 'Website Redesign', task: 'Design homepage', date: '2025-11-07', hours: 8, status: 'Billed', user: 'John Doe' },
    { id: 2, project: 'Mobile App', task: 'Implement auth', date: '2025-11-07', hours: 6.5, status: 'Unbilled', user: 'Jane Smith' },
    { id: 3, project: 'Website Redesign', task: 'Create wireframes', date: '2025-11-06', hours: 4, status: 'Unbilled', user: 'John Doe' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Timesheets</h1>
          <p className="text-muted-foreground">Log and track time spent on tasks</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Log Time
        </Button>
      </div>

      <div className="bg-card border rounded-xl">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search timesheets..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium text-sm">Project</th>
                <th className="text-left p-4 font-medium text-sm">Task</th>
                <th className="text-left p-4 font-medium text-sm">User</th>
                <th className="text-left p-4 font-medium text-sm">Date</th>
                <th className="text-left p-4 font-medium text-sm">Hours</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {timesheets.map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/50">
                  <td className="p-4">{entry.project}</td>
                  <td className="p-4">{entry.task}</td>
                  <td className="p-4">{entry.user}</td>
                  <td className="p-4">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{entry.hours}h</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.status === 'Billed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
