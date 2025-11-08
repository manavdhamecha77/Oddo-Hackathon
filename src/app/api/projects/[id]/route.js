import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single project
export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        projectManager: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        customer: true,
        tasks: {
          include: {
            assignedUser: {
              select: { id: true, firstName: true, lastName: true, email: true }
            },
            timesheets: true
          }
        },
        salesOrders: true,
        purchaseOrders: true,
        customerInvoices: true,
        vendorBills: true,
        expenses: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update project
export async function PUT(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if user is PM or Admin (case-insensitive)
    const userRole = user.role?.toUpperCase();
    if (!['PROJECT_MANAGER', 'ADMIN'].includes(userRole)) {
      console.log('Role check failed. User role:', user.role, 'Normalized:', userRole);
      return NextResponse.json({ error: `Forbidden: Role '${user.role}' cannot edit projects` }, { status: 403 });
    }

    const { id } = await params;
    const { name, client, description, startDate, dueDate, budget, status } = await req.json();

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: dueDate ? new Date(dueDate) : undefined,
        budget: budget ? parseFloat(budget) : undefined,
        status
      },
      include: {
        projectManager: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        customer: true
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE project
export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if user is Project Manager or Admin (case-insensitive)
    const userRole = user.role?.toUpperCase();
    if (!['PROJECT_MANAGER', 'ADMIN'].includes(userRole)) {
      console.log('Role check failed. User role:', user.role, 'Normalized:', userRole);
      return NextResponse.json({ error: `Forbidden: Role '${user.role}' cannot delete projects` }, { status: 403 });
    }

    const { id } = await params;

    await prisma.project.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
