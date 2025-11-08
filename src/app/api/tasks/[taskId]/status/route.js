import { NextResponse } from 'next/server';
import { getUserFromRequest, requireRole } from '@/lib/roleGuard';
import { prisma } from '@/lib/prisma';

export async function PATCH(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin or project_manager can update task status
    if (!requireRole(user, ['admin', 'project_manager'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { taskId } = await params;
    const { status } = await req.json();

    // Validate status
    const validStatuses = ['new', 'in_progress', 'blocked', 'done'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { status },
      include: {
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 });
  }
}
