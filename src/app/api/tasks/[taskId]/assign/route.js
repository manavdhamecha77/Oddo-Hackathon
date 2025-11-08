import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST - Assign current user to task
export async function POST(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;

    // Check if user is already assigned
    const existingAssignment = await prisma.taskAssignment.findUnique({
      where: {
        taskId_userId: {
          taskId: parseInt(taskId),
          userId: user.id
        }
      }
    });

    if (existingAssignment) {
      return NextResponse.json({ error: "You are already assigned to this task" }, { status: 400 });
    }

    // Create assignment
    await prisma.taskAssignment.create({
      data: {
        taskId: parseInt(taskId),
        userId: user.id,
        assignedBy: user.id
      }
    });

    // Fetch updated task with all assignees
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      include: {
        assignees: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error assigning task:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Unassign current user from task
export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;

    await prisma.taskAssignment.delete({
      where: {
        taskId_userId: {
          taskId: parseInt(taskId),
          userId: user.id
        }
      }
    });

    // Fetch updated task with all assignees
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      include: {
        assignees: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error unassigning task:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
