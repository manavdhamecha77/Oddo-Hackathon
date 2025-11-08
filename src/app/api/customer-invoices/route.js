import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendRealtimeUpdate } from "@/app/api/events/route";

// GET all customer invoices
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get query parameters
    const { searchParams} = new URL(req.url);
    const projectId = searchParams.get('projectId');

    let whereClause = {};

    // Filter by project if provided
    if (projectId) {
      whereClause.projectId = parseInt(projectId);
      
      // For non-admins, verify the project belongs to their company
      if (user.role !== 'admin') {
        const project = await prisma.project.findUnique({
          where: { id: parseInt(projectId) },
          select: { projectManager: { select: { companyId: true } } }
        });
        
        if (!project || project.projectManager?.companyId !== user.companyId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    } else {
      // If no projectId provided, non-admins only see their company's invoices
      if (user.role !== 'admin') {
        whereClause.project = {
          projectManager: {
            companyId: user.companyId
          }
        };
      }
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
    if (!['project_manager', 'sales_finance', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { projectId, invoiceNumber, customerId, salesOrderId, invoiceDate, dueDate, totalAmount, status, notes, lines } = await req.json();

    if (!projectId || !invoiceNumber || !customerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // CRITICAL: Verify project exists and belongs to user's company (unless user is admin)
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        projectManager: { select: { companyId: true } }
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Non-admins must belong to the same company
    if (user.role !== 'admin' && project.projectManager?.companyId !== user.companyId) {
      return NextResponse.json({ error: "Forbidden: Invalid company access" }, { status: 403 });
    }

    const invoice = await prisma.customerInvoice.create({
      data: {
        invoiceNumber,
        customerId: parseInt(customerId),
        salesOrderId: salesOrderId ? parseInt(salesOrderId) : null,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
        status: status || 'draft',
        projectId: parseInt(projectId),
        notes: notes || null,
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
        salesOrder: true,
        lines: true
      }
    });

    // Broadcast real-time update
    sendRealtimeUpdate(user.companyId, 'invoice_created', {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      projectId: invoice.projectId,
      customer: invoice.customer,
      totalAmount: invoice.totalAmount,
      status: invoice.status
    })

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating customer invoice:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
