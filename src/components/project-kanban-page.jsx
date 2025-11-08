'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, DollarSign, TrendingUp, Clock, FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from '@/components/kanban-board';
import { TaskModal } from '@/components/task-modal';

export function ProjectKanbanPage({ projectId, backLink = '/dashboard/projects' }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState('new');

  // Determine permissions based on role
  const canCreateTasks = ['admin', 'project_manager'].includes(userRole);
  const canEditAllTasks = ['admin', 'project_manager'].includes(userRole);
  const canViewFinancials = ['admin', 'project_manager', 'sales_finance'].includes(userRole);

  useEffect(() => {
    if (!projectId) return;

    // Fetch user role
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setUserRole(data?.role))
      .catch(() => setUserRole(null));

    // Fetch project details
    fetchProject();
    
    // Fetch tasks
    fetchTasks();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        // Refresh tasks
        fetchTasks();
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const handleTaskCreate = async (status = 'new') => {
    setInitialStatus(status);
    setIsModalOpen(true);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        // Refresh tasks
        fetchTasks();
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  if (!project) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href={backLink}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            {project.customer && (
              <p className="text-muted-foreground mb-4">{project.customer.name}</p>
            )}
            {project.description && (
              <p className="text-sm text-muted-foreground max-w-2xl">{project.description}</p>
            )}
          </div>
          {canCreateTasks && (
            <Button onClick={() => handleTaskCreate('new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Financial Stats (if user has permission) */}
      {canViewFinancials && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Budget</span>
              <DollarSign className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold">${project.budget || '0.00'}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold capitalize">{project.status?.replace('_', ' ') || 'N/A'}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <Clock className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{project.progress || 0}%</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Tasks</span>
              <FileText className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold">{tasks.length}</p>
          </div>
        </div>
      )}

      {/* Financial Documents Links */}
      {canViewFinancials && (
        <div className="mb-8 bg-card border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Financial Documents</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href={`${backLink.split('/projects')[0]}/sales-orders?project=${projectId}`} 
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-sm">Sales Orders</p>
                <p className="text-xs text-muted-foreground">View orders</p>
              </div>
            </Link>
            <Link 
              href={`${backLink.split('/projects')[0]}/purchase-orders?project=${projectId}`} 
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <FileText className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium text-sm">Purchase Orders</p>
                <p className="text-xs text-muted-foreground">View orders</p>
              </div>
            </Link>
            <Link 
              href={`${backLink.split('/projects')[0]}/invoices?project=${projectId}`} 
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Receipt className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">Invoices</p>
                <p className="text-xs text-muted-foreground">View invoices</p>
              </div>
            </Link>
            <Link 
              href={`${backLink.split('/projects')[0]}/vendor-bills?project=${projectId}`} 
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Receipt className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-sm">Vendor Bills</p>
                <p className="text-xs text-muted-foreground">View bills</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6">Task Board</h2>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskCreate={canCreateTasks ? handleTaskCreate : null}
            projectId={projectId}
          />
        )}
      </div>

      {/* Task Modal */}
      {canCreateTasks && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleTaskSubmit}
          projectId={projectId}
          initialStatus={initialStatus}
        />
      )}
    </div>
  );
}
