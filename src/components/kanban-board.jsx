'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './task-card';
import { KanbanColumn } from './kanban-column';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

const TASK_STATUSES = [
  { id: 'new', label: 'To Do', color: 'bg-gray-100' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100' },
  { id: 'blocked', label: 'Blocked', color: 'bg-red-100' },
  { id: 'done', label: 'Done', color: 'bg-green-100' }
];

export function KanbanBoard({ tasks, onTaskUpdate, onTaskCreate, projectId }) {
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    const taskId = active.id;
    const newStatus = over.id;

    // Find the task being moved
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== newStatus) {
      // Optimistically update the UI
      await onTaskUpdate(taskId, { status: newStatus });
    }

    setActiveId(null);
    setActiveTask(null);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          {TASK_STATUSES.map((status) => {
            const statusTasks = getTasksByStatus(status.id);
            return (
              <KanbanColumn
                key={status.id}
                status={status}
                tasks={statusTasks}
                onTaskCreate={onTaskCreate}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <TaskCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
