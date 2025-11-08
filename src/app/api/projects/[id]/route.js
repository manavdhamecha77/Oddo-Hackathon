import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single project
export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        tasks: {
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true }
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

    // Check if user is PM or Admin
    if (!['PROJECT_MANAGER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const { name, client, description, startDate, dueDate, budget, status } = await req.json();

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        name,
        client,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        budget: budget ? parseFloat(budget) : undefined,
        status
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
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

    // Check if user is Admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden: Only admins can delete projects" }, { status: 403 });
    }

    const { id } = params;

    await prisma.project.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
