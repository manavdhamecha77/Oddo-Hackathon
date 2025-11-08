import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all timesheets
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const billed = searchParams.get('billed');

    // Build where clause
    const whereClause = {
      user: {
        companyId: user.companyId
      }
    };

    // Filter by project if provided
    if (projectId) {
      whereClause.projectId = parseInt(projectId);
    }

    // Filter by billed status if provided
    if (billed !== null) {
      whereClause.isBilled = billed === 'true';
    }

    // CRITICAL: Filter by companyId to prevent cross-company data access
    const timesheets = await prisma.timesheet.findMany({
      where: whereClause,
      include: {
        task: {
          include: {
            project: true
          }
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { workDate: 'desc' }
    });

    return NextResponse.json(timesheets);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new timesheet entry
export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, taskId, hours, workDate, isBillable, description } = await req.json();

    // Validate required fields
    if (!projectId || !taskId || !hours || !workDate) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, taskId, hours, workDate" },
        { status: 400 }
      );
    }

    // Validate hours is a valid positive number
    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > 24) {
      return NextResponse.json(
        { error: "Hours must be a positive number between 0 and 24" },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      select: { id: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify task exists and belongs to the project
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      select: { id: true, projectId: true }
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.projectId !== parseInt(projectId)) {
      return NextResponse.json(
        { error: "Task does not belong to the specified project" },
        { status: 400 }
      );
    }

    // Get user's hourly rate
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { hourlyRate: true }
    });

    // Create timesheet entry
    const timesheet = await prisma.timesheet.create({
      data: {
        taskId: parseInt(taskId),
        userId: user.id,
        projectId: parseInt(projectId),
        workDate: new Date(workDate),
        hours: hoursNum,
        isBillable: isBillable ?? true,
        hourlyRate: userData?.hourlyRate || 0,
        description: description || null
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        task: {
          select: { id: true, title: true }
        },
        user: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    return NextResponse.json(timesheet, { status: 201 });
  } catch (error) {
    console.error('Error creating timesheet:', error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
