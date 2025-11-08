import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single task
export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      include: {
        assignees: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update task
export async function PUT(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const data = await req.json();

    // Prepare update data
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;
    if (data.blockerReason !== undefined) updateData.blockerReason = data.blockerReason;

    // Handle assignees separately if provided
    if (data.assignedUserIds !== undefined) {
      // Delete existing assignments
      await prisma.taskAssignment.deleteMany({
        where: { taskId: parseInt(taskId) }
      });
      
      // Create new assignments
      if (data.assignedUserIds && data.assignedUserIds.length > 0) {
        await prisma.taskAssignment.createMany({
          data: data.assignedUserIds.map(userId => ({
            taskId: parseInt(taskId),
            userId: parseInt(userId),
            assignedBy: user.id
          }))
        });
      }
    }

    const task = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: updateData,
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
    console.error('Error updating task:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE task
export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;

    await prisma.task.delete({
      where: { id: parseInt(taskId) }
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
