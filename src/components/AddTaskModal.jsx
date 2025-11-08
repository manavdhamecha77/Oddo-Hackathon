'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AddTaskModal({ isOpen, onClose, projectId, onTaskCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedUserIds: [],
    status: 'new',
    priority: 'medium',
    dueDate: '',
    estimatedHours: '',
  })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/projects/${projectId}/members`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setUsers(data))
        .catch(() => setUsers([]))
    }
  }, [isOpen, projectId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      projectId: parseInt(projectId),
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      assignedUserIds: formData.assignedUserIds,
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate || null,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
    }

    console.log('ProjectId:', projectId, 'Payload:', payload)

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const task = await res.json()
        onTaskCreated(task)
        handleClose()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create task')
      }
    } catch (err) {
      console.error('Error creating task:', err)
      setError('An error occurred while creating the task')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      assignedUserIds: [],
      status: 'new',
      priority: 'medium',
      dueDate: '',
      estimatedHours: '',
    })
    setError('')
    onClose()
  }

  const toggleAssignee = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignedUserIds: prev.assignedUserIds.includes(userId)
        ? prev.assignedUserIds.filter(id => id !== userId)
        : [...prev.assignedUserIds, userId]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Task</h2>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background min-h-[100px]"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Assign To (Multiple)</label>
            <div className="border rounded-lg bg-background p-2 max-h-40 overflow-y-auto space-y-1">
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No team members available</p>
              ) : (
                users.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assignedUserIds.includes(user.id)}
                      onChange={() => toggleAssignee(user.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      {user.firstName} {user.lastName}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="new">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estimated Hours</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="0.0"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
