import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all projects
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const projects = await prisma.project.findMany({
      include: {
        projectManager: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        customer: {
          select: { id: true, name: true }
        },
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new project
export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if user is PM or Admin (allow all roles for now during development)
    // if (!['project_manager', 'admin'].includes(user.role)) {
    //   return NextResponse.json({ error: "Forbidden: Only Project Managers can create projects" }, { status: 403 });
    // }

    const { name, description, startDate, dueDate, budget, status } = await req.json();

    if (!name || !startDate || !dueDate) {
      return NextResponse.json({ error: "Missing required fields: name, startDate, dueDate" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(dueDate),
        budget: budget ? parseFloat(budget) : 0,
        status: status || 'planned',
        projectManagerId: user.id, // Assign current user as project manager
        progress: 0
      },
      include: {
        projectManager: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
