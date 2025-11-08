'use client'
import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, MoreVertical, Clock, Receipt, FileText, DollarSign, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AddTaskModal from '@/components/AddTaskModal'

export default function ProjectDetailPage({ params }) {
  const resolvedParams = use(params)
  const { id } = resolvedParams
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], review: [], done: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/projects/${id}/kanban`)
      .then(res => res.ok ? res.json() : { todo: [], inProgress: [], review: [], done: [] })
      .then(data => setTasks(data))
      .catch(() => setTasks({ todo: [], inProgress: [], review: [], done: [] }))
      .finally(() => setLoading(false))
  }, [id])

  const handleTaskCreated = (task) => {
    const statusMap = { 'new': 'todo', 'in_progress': 'inProgress', 'blocked': 'review', 'done': 'done' }
    const column = statusMap[task.status]
    setTasks(prev => ({ ...prev, [column]: [task, ...prev[column]] }))
  }

  const project = {
    projectId: id,
    title: 'Website Redesign',
    client: 'TechCorp',
    description: 'Complete redesign of the company website with modern UI/UX',
    status: 'In Progress',
    progress: 65,
    startDate: '2025-01-15',
    dueDate: '2025-03-30',
    revenue: '$45,000',
    costs: '$32,550',
    profit: '$12,450'
  }

  const getPriorityColor = (priority) => {
    const p = priority?.toLowerCase()
    if (p === 'urgent' || p === 'high') return 'text-red-600 bg-red-50 dark:bg-red-900/20'
    if (p === 'medium') return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    if (p === 'low') return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    return 'text-gray-600 bg-gray-50'
  }

  const formatAssignee = (task) => {
    if (!task.assignedUser) return 'Unassigned'
    const name = `${task.assignedUser.firstName || ''} ${task.assignedUser.lastName || ''}`.trim()
    return name || task.assignedUser.email
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="text-muted-foreground mb-4">{project.client}</p>
            <p className="text-sm text-muted-foreground max-w-2xl">{project.description}</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Revenue</span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{project.revenue}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Costs</span>
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold">{project.costs}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Profit</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{project.profit}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">{project.progress}%</p>
        </div>
      </div>

      <div className="mb-8 bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Financial Documents</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href={`/dashboard/sales-orders?project=${id}`} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <FileText className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-sm">Sales Orders</p>
              <p className="text-xs text-muted-foreground">2 orders</p>
            </div>
          </Link>
          <Link href={`/dashboard/purchase-orders?project=${id}`} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <FileText className="w-5 h-5 text-purple-500" />
            <div>
              <p className="font-medium text-sm">Purchase Orders</p>
              <p className="text-xs text-muted-foreground">3 orders</p>
            </div>
          </Link>
          <Link href={`/dashboard/invoices?project=${id}`} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <Receipt className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-sm">Invoices</p>
              <p className="text-xs text-muted-foreground">5 invoices</p>
            </div>
          </Link>
          <Link href={`/dashboard/vendor-bills?project=${id}`} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <DollarSign className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-medium text-sm">Vendor Bills</p>
              <p className="text-xs text-muted-foreground">4 bills</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6">Task Board</h2>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">To Do</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{tasks.todo.length}</span>
              </div>
              <div className="space-y-3">
                {tasks.todo.map(task => (
                  <div key={task.id} className="bg-background border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <button className="p-1 hover:bg-muted rounded">
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{formatAssignee(task)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">In Progress</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{tasks.inProgress.length}</span>
              </div>
              <div className="space-y-3">
                {tasks.inProgress.map(task => (
                  <div key={task.id} className="bg-background border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <button className="p-1 hover:bg-muted rounded">
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{formatAssignee(task)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Review</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{tasks.review.length}</span>
              </div>
              <div className="space-y-3">
                {tasks.review.map(task => (
                  <div key={task.id} className="bg-background border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <button className="p-1 hover:bg-muted rounded">
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{formatAssignee(task)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Done</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{tasks.done.length}</span>
              </div>
              <div className="space-y-3">
                {tasks.done.map(task => (
                  <div key={task.id} className="bg-background border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow opacity-75">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <button className="p-1 hover:bg-muted rounded">
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{formatAssignee(task)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {id && (
        <AddTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectId={id}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  )
}
