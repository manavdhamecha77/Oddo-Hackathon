import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single purchase order
export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: true,
        lines: true
      }
    });

    if (!purchaseOrder) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update purchase order
export async function PUT(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    if (!['PROJECT_MANAGER', 'SALES_FINANCE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const { orderNumber, vendorName, orderDate, totalAmount, status, lines } = await req.json();

    // Update purchase order
    const updatedPurchaseOrder = await prisma.purchaseOrder.update({
      where: { id: parseInt(id) },
      data: {
        ...(orderNumber && { orderNumber }),
        ...(vendorName && { vendorName }),
        ...(orderDate && { orderDate: new Date(orderDate) }),
        ...(totalAmount !== undefined && { totalAmount: parseFloat(totalAmount) }),
        ...(status && { status })
      },
      include: {
        project: true,
        lines: true
      }
    });

    return NextResponse.json(updatedPurchaseOrder);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE purchase order
export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only ADMIN can delete
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { id } = params;
    await prisma.purchaseOrder.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Purchase order deleted successfully" });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
