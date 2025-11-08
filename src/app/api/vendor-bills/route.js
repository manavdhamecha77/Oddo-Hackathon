import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendRealtimeUpdate } from "@/app/api/events/route";

// GET all vendor bills
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get query parameters
    const { searchParams } = new URL(req.url);
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
      // If no projectId provided, non-admins only see their company's bills
      if (user.role !== 'admin') {
        whereClause.project = {
          projectManager: {
            companyId: user.companyId
          }
        };
      }
    }

    // CRITICAL: Filter by companyId to prevent cross-company data access
    const vendorBills = await prisma.vendorBill.findMany({
      where: whereClause,
      include: {
        project: true,
        vendor: true,
        purchaseOrder: true,
        lines: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(vendorBills);
  } catch (error) {
    console.error('Error fetching vendor bills:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new vendor bill
export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    if (!['project_manager', 'sales_finance', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { projectId, billNumber, vendorId, purchaseOrderId, billDate, dueDate, totalAmount, status, notes, lines } = await req.json();

    if (!projectId || !billNumber || !vendorId) {
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

    const vendorBill = await prisma.vendorBill.create({
      data: {
        billNumber,
        vendorId: parseInt(vendorId),
        purchaseOrderId: purchaseOrderId ? parseInt(purchaseOrderId) : null,
        billDate: billDate ? new Date(billDate) : new Date(),
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
        vendor: true,
        purchaseOrder: true,
        lines: true
      }
    });

    // Broadcast real-time update
    sendRealtimeUpdate(user.companyId, 'vendor_bill_created', {
      id: vendorBill.id,
      billNumber: vendorBill.billNumber,
      projectId: vendorBill.projectId,
      vendor: vendorBill.vendor,
      totalAmount: vendorBill.totalAmount,
      status: vendorBill.status
    })

    return NextResponse.json(vendorBill, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor bill:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
