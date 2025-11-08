'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

export function TaskCard({ task, isDragging = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignedUserName = task.assignedUser 
    ? `${task.assignedUser.firstName || ''} ${task.assignedUser.lastName || ''}`.trim() || task.assignedUser.email
    : 'Unassigned';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="space-y-2">
        {/* Title */}
        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Blocker Reason */}
        {task.status === 'blocked' && task.blockerReason && (
          <div className="flex items-start gap-1 text-xs text-red-600 bg-red-50 p-2 rounded">
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{task.blockerReason}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          {/* Priority Badge */}
          <span className={`px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
            {task.priority}
          </span>

          {/* Assignee & Due Date */}
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
              </div>
            )}
            {task.assignedUser && (
              <div 
                className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium"
                title={assignedUserName}
              >
                {(task.assignedUser.firstName?.[0] || task.assignedUser.email[0]).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Estimated Hours */}
        {task.estimatedHours && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{task.estimatedHours}h estimated</span>
          </div>
        )}
      </div>
    </div>
  );
}
