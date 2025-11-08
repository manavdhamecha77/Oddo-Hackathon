'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data);
    };
    fetchUser();
  }, []);

  // Mock data - will be replaced with real API data
  const stats = [
    { label: 'Active Projects', value: '12', change: '+3 this month', icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Total Revenue', value: '$125,450', change: '+12% from last month', icon: DollarSign, color: 'text-green-500' },
    { label: 'Hours Logged', value: '847', change: 'This month', icon: Clock, color: 'text-purple-500' },
    { label: 'Pending Invoices', value: '5', change: '$23,400 outstanding', icon: AlertCircle, color: 'text-orange-500' },
  ]

  const recentProjects = [
    { id: 1, name: 'Website Redesign', client: 'TechCorp', status: 'In Progress', profit: '$12,450', progress: 65 },
    { id: 2, name: 'Mobile App Development', client: 'StartupHub', status: 'In Progress', profit: '$28,900', progress: 45 },
    { id: 3, name: 'Marketing Campaign', client: 'BrandCo', status: 'Planning', profit: '$8,200', progress: 20 },
    { id: 4, name: 'Database Migration', client: 'DataSoft', status: 'In Progress', profit: '$15,670', progress: 80 },
  ]

  if (!user) return <div className="p-8"><p>Loading...</p></div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}! Here's what's happening with your projects.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/create">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <p className="text-sm text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="bg-card border rounded-xl">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/projects">View All</Link>
          </Button>
        </div>
        <div className="divide-y">
          {recentProjects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="p-6 hover:bg-muted/50 transition-colors flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.client}</p>
              </div>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className="text-sm font-medium">{project.status}</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Profit</p>
                  <span className="text-sm font-semibold text-green-600">{project.profit}</span>
                </div>
                <div className="w-32">
                  <p className="text-sm text-muted-foreground mb-2">Progress</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
