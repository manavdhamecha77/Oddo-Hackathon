import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PUT update task status (for Kanban drag & drop)
export async function PUT(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { status },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
