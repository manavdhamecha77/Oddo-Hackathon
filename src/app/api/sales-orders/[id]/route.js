import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single sales order
export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: true,
        customer: true,
        lines: true
      }
    });

    if (!salesOrder) {
      return NextResponse.json({ error: "Sales order not found" }, { status: 404 });
    }

    return NextResponse.json(salesOrder);
  } catch (error) {
    console.error('Error fetching sales order:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update sales order
export async function PUT(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    if (!['PROJECT_MANAGER', 'SALES_FINANCE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { orderNumber, customerId, orderDate, totalAmount, status, lines } = await req.json();

    // Update sales order
    const updatedSalesOrder = await prisma.salesOrder.update({
      where: { id: parseInt(id) },
      data: {
        ...(orderNumber && { orderNumber }),
        ...(customerId && { customerId: parseInt(customerId) }),
        ...(orderDate && { orderDate: new Date(orderDate) }),
        ...(totalAmount !== undefined && { totalAmount: parseFloat(totalAmount) }),
        ...(status && { status })
      },
      include: {
        project: true,
        customer: true,
        lines: true
      }
    });

    return NextResponse.json(updatedSalesOrder);
  } catch (error) {
    console.error('Error updating sales order:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE sales order
export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only ADMIN can delete
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.salesOrder.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Sales order deleted successfully" });
  } catch (error) {
    console.error('Error deleting sales order:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
