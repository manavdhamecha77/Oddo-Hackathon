import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendRealtimeUpdate } from "@/app/api/events/route";

// GET all purchase orders
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

    // CRITICAL: Filter by companyId to prevent cross-company data access
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        lines: true,
        vendorBills: {
          select: {
            id: true,
            billNumber: true,
            totalAmount: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new purchase order
export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    console.log('User from request:', { id: user?.id, role: user?.role, companyId: user?.companyId });
    
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    if (!['project_manager', 'sales_finance', 'admin'].includes(user.role)) {
      console.log('Role check failed. User role:', user.role);
      return NextResponse.json({ error: "Forbidden - Invalid role" }, { status: 403 });
    }

    const { projectId, orderNumber, vendorId, orderDate, totalAmount, status, lines, notes } = await req.json();
    console.log('Received data:', { projectId, orderNumber, vendorId, userCompanyId: user.companyId });

    if (!projectId || !orderNumber || !vendorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // CRITICAL: Verify project belongs to user's company
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        projectManager: { select: { companyId: true } }
      }
    });

    console.log('Project lookup:', { 
      projectExists: !!project, 
      projectCompanyId: project?.projectManager?.companyId, 
      userCompanyId: user.companyId,
      match: project?.projectManager?.companyId === user.companyId
    });

    if (!project || project.projectManager.companyId !== user.companyId) {
      return NextResponse.json({ 
        error: "Forbidden: Invalid company access",
        details: {
          projectExists: !!project,
          projectCompanyId: project?.projectManager?.companyId,
          userCompanyId: user.companyId
        }
      }, { status: 403 });
    }

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        vendorId: parseInt(vendorId),
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
        status: status || 'draft',
        notes: notes || null,
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
        project: {
          select: {
            id: true,
            name: true
          }
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        lines: true
      }
    });

    // Broadcast real-time update
    sendRealtimeUpdate(user.companyId, 'purchase_order_created', {
      id: purchaseOrder.id,
      orderNumber: purchaseOrder.orderNumber,
      projectId: purchaseOrder.projectId,
      vendor: purchaseOrder.vendor,
      totalAmount: purchaseOrder.totalAmount,
      status: purchaseOrder.status
    })

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
