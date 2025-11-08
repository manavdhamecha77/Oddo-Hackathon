import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST log time for a task
export async function POST(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = params;
    const { hours, description, date } = await req.json();

    if (!hours || hours <= 0) {
      return NextResponse.json({ error: "Valid hours required" }, { status: 400 });
    }

    const timesheet = await prisma.timesheet.create({
      data: {
        hours: parseFloat(hours),
        description,
        date: date ? new Date(date) : new Date(),
        isBilled: false,
        taskId: parseInt(taskId),
        userId: user.id
      },
      include: {
        task: {
          include: {
            project: true
          }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(timesheet, { status: 201 });
  } catch (error) {
    console.error('Error creating timesheet:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET all timesheets for a task
export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = params;

    const timesheets = await prisma.timesheet.findMany({
      where: { taskId: parseInt(taskId) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(timesheets);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
