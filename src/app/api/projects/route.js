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
        createdBy: {
          select: { id: true, name: true, email: true }
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

    // Check if user is PM or Admin
    if (!['PROJECT_MANAGER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden: Only Project Managers can create projects" }, { status: 403 });
    }

    const { name, client, description, startDate, dueDate, budget, status } = await req.json();

    if (!name || !client || !startDate || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        client,
        description,
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
        budget: budget ? parseFloat(budget) : null,
        status: status || 'Planning',
        createdById: user.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
