'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './task-card';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

export function KanbanColumn({ status, tasks, onTaskCreate }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
  });

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between p-3 rounded-t-lg ${status.color}`}>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{status.label}</h3>
          <span className="bg-white/60 px-2 py-0.5 rounded-full text-xs font-medium">
            {tasks.length}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => onTaskCreate && onTaskCreate(status.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-2 bg-muted/20 rounded-b-lg border-2 transition-colors ${
          isOver ? 'border-primary bg-primary/5' : 'border-transparent'
        }`}
        style={{ minHeight: '500px' }}
      >
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No tasks
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
