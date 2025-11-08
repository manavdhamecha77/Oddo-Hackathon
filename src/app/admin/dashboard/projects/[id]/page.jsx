'use client'
import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, MoreVertical, Clock, Receipt, FileText, DollarSign, TrendingUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LinksPanel from '@/components/billing/LinksPanel'
import ProjectMembersPanel from '@/components/project/ProjectMembersPanel'

export default function ProjectDetailPage({ params }) {
  const { id } = use(params)
  const [userRole, setUserRole] = useState(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], review: [], done: [] })
  const [isLoadingProject, setIsLoadingProject] = useState(true)
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)

  useEffect(() => {
    fetchUserRole()
    if (id) {
      fetchProject()
      fetchTasks()
    }
  }, [id])

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUserRole(userData.role)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    } finally {
      setIsLoadingUser(false)
    }
  }

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setIsLoadingProject(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/kanban`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoadingTasks(false)
    }
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
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            {isLoadingProject ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">{project?.name || 'Project'}</h1>
                <p className="text-muted-foreground mb-4">{project?.customer?.name || 'No customer'}</p>
                <p className="text-sm text-muted-foreground max-w-2xl">{project?.description || 'No description'}</p>
              </>
            )}
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Budget</span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold">
            {isLoadingProject ? <Loader2 className="w-6 h-6 animate-spin" /> : `$${project?.budget || 0}`}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Status</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold capitalize">
            {isLoadingProject ? <Loader2 className="w-6 h-6 animate-spin" /> : (project?.status?.replace('_', ' ') || 'N/A')}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">
            {isLoadingProject ? <Loader2 className="w-6 h-6 animate-spin" /> : `${project?.progress || 0}%`}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tasks</span>
            <FileText className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold">
            {isLoadingTasks ? <Loader2 className="w-6 h-6 animate-spin" /> : (tasks.todo.length + tasks.inProgress.length + tasks.review.length + tasks.done.length)}
          </p>
        </div>
      </div>

      {/* Project Team Members */}
      {isLoadingUser ? (
        <div className="mb-8 bg-card border rounded-xl p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <ProjectMembersPanel projectId={id} userRole={userRole} />
        </div>
      )}

      {/* Links Panel with Billing Engine */}
      {isLoadingUser || !id ? (
        <div className="mb-8 bg-card border rounded-xl p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <LinksPanel projectId={id} userRole={userRole} />
        </div>
      )}

      {/* Kanban Board */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6">Task Board</h2>
        {isLoadingTasks ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* To Do Column */}
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

          {/* In Progress Column */}
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

          {/* Review Column */}
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

          {/* Done Column */}
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
    </div>
  )
}
