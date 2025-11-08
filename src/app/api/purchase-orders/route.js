import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all purchase orders
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        project: true,
        lines: true
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
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    if (!['PROJECT_MANAGER', 'SALES_FINANCE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { projectId, orderNumber, vendorName, orderDate, totalAmount, status, lines } = await req.json();

    if (!projectId || !orderNumber || !vendorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        vendorName,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
        status: status || 'Draft',
        projectId: parseInt(projectId),
        lines: lines ? {
          create: lines.map(line => ({
            description: line.description,
            quantity: parseFloat(line.quantity),
            unitPrice: parseFloat(line.unitPrice),
            amount: parseFloat(line.amount)
          }))
        } : undefined
      },
      include: {
        project: true,
        lines: true
      }
    });

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
