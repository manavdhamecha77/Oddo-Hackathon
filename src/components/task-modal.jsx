'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function TaskModal({ isOpen, onClose, onSubmit, task = null, projectId, initialStatus = 'new' }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    estimatedHours: '',
    blockerReason: ''
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (isOpen && projectId) {
      fetch(`/api/projects/${projectId}/members`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setUsers(data))
        .catch(() => setUsers([]));
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'new',
        priority: task.priority || 'medium',
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        estimatedHours: task.estimatedHours || '',
        blockerReason: task.blockerReason || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: initialStatus,
        priority: 'medium',
        assignedTo: '',
        dueDate: '',
        estimatedHours: '',
        blockerReason: ''
      });
    }
  }, [task, initialStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: 'new',
      priority: 'medium',
      assignedTo: '',
      dueDate: '',
      estimatedHours: '',
      blockerReason: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div 
        className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              className="w-full px-3 py-2 border rounded-md min-h-[100px] bg-background"
            />
          </div>

          <div>
            <Label htmlFor="assignedTo">Assign To</Label>
            <select
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="new">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          {formData.status === 'blocked' && (
            <div>
              <Label htmlFor="blockerReason">Blocker Reason</Label>
              <Input
                id="blockerReason"
                value={formData.blockerReason}
                onChange={(e) => setFormData({ ...formData, blockerReason: e.target.value })}
                placeholder="Why is this task blocked?"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
