import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/roleGuard';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      projectId, 
      title, 
      description, 
      assignedTo, 
      status = 'new',
      priority = 'medium',
      dueDate,
      estimatedHours 
    } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required' }, 
        { status: 400 }
      );
    }

    console.log("ffffffffffffffffffffff "+projectId +title)

    if (projectId === undefined || projectId === null || projectId === '') {
      return NextResponse.json(
        { error: 'Project ID is required' }, 
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!project) {
      return NextResponse.json(
        { error: `Project with ID ${projectId} not found` }, 
        { status: 404 }
      );
    }

    const task = await prisma.task.create({
      data: {
        projectId: parseInt(projectId),
        title,
        description,
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        createdBy: user.id,
      },
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

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
