import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all customer invoices
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    // Build where clause
    const whereClause = {
      project: {
        projectManager: {
          companyId: user.companyId
        }
      }
    };

    // Filter by project if provided
    if (projectId) {
      whereClause.projectId = parseInt(projectId);
    }

    // Filter by companyId to prevent cross-company data access
    const invoices = await prisma.customerInvoice.findMany({
      where: whereClause,
      include: {
        project: true,
        lines: true,
        customer: true,
        salesOrder: true,
        creator: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching customer invoices:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new customer invoice
export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    if (!['PROJECT_MANAGER', 'SALES_FINANCE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { projectId, invoiceNumber, customerId, invoiceDate, dueDate, totalAmount, status, lines } = await req.json();

    if (!projectId || !invoiceNumber || !customerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // CRITICAL: Verify project belongs to user's company
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        projectManager: { select: { companyId: true } }
      }
    });

    if (!project || project.projectManager.companyId !== user.companyId) {
      return NextResponse.json({ error: "Forbidden: Invalid company access" }, { status: 403 });
    }

    const invoice = await prisma.customerInvoice.create({
      data: {
        invoiceNumber,
        customerId: parseInt(customerId),
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
        status: status || 'draft',
        projectId: parseInt(projectId),
        createdBy: user.id,
        lines: lines ? {
          create: lines.map(line => ({
            description: line.description,
            quantity: parseFloat(line.quantity),
            unitPrice: parseFloat(line.unitPrice)
          }))
        } : undefined
      },
      include: {
        project: true,
        customer: true,
        lines: true
      }
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating customer invoice:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
