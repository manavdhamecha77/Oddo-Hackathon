'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data
  const projects = [
    { 
      id: 1, 
      name: 'Website Redesign', 
      client: 'TechCorp', 
      status: 'In Progress', 
      progress: 65,
      revenue: '$45,000',
      costs: '$32,550',
      profit: '$12,450',
      startDate: '2025-01-15',
      dueDate: '2025-03-30'
    },
    { 
      id: 2, 
      name: 'Mobile App Development', 
      client: 'StartupHub', 
      status: 'In Progress', 
      progress: 45,
      revenue: '$89,000',
      costs: '$60,100',
      profit: '$28,900',
      startDate: '2025-02-01',
      dueDate: '2025-06-15'
    },
    { 
      id: 3, 
      name: 'Marketing Campaign', 
      client: 'BrandCo', 
      status: 'Planning', 
      progress: 20,
      revenue: '$25,000',
      costs: '$16,800',
      profit: '$8,200',
      startDate: '2025-03-01',
      dueDate: '2025-04-30'
    },
    { 
      id: 4, 
      name: 'Database Migration', 
      client: 'DataSoft', 
      status: 'In Progress', 
      progress: 80,
      revenue: '$52,000',
      costs: '$36,330',
      profit: '$15,670',
      startDate: '2024-12-10',
      dueDate: '2025-02-28'
    },
  ]

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'On Hold': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage all your projects and track their profitability</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/create">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/projects/${project.id}`}
            className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.client}</p>
              </div>
              <button className="p-1 hover:bg-muted rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                <p className="text-sm font-semibold">{project.revenue}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Costs</p>
                <p className="text-sm font-semibold">{project.costs}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Profit</p>
                <p className="text-sm font-semibold text-green-600">{project.profit}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              <span className="text-xs text-muted-foreground">
                Due: {new Date(project.dueDate).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
