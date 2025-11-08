import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single vendor bill
export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const vendorBill = await prisma.vendorBill.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: true,
        lines: true
      }
    });

    if (!vendorBill) {
      return NextResponse.json({ error: "Vendor bill not found" }, { status: 404 });
    }

    return NextResponse.json(vendorBill);
  } catch (error) {
    console.error('Error fetching vendor bill:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update vendor bill
export async function PUT(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    if (!['PROJECT_MANAGER', 'SALES_FINANCE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { billNumber, vendorName, billDate, dueDate, totalAmount, status } = await req.json();

    const updatedVendorBill = await prisma.vendorBill.update({
      where: { id: parseInt(id) },
      data: {
        ...(billNumber && { billNumber }),
        ...(vendorName && { vendorName }),
        ...(billDate && { billDate: new Date(billDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(totalAmount !== undefined && { totalAmount: parseFloat(totalAmount) }),
        ...(status && { status })
      },
      include: {
        project: true,
        lines: true
      }
    });

    return NextResponse.json(updatedVendorBill);
  } catch (error) {
    console.error('Error updating vendor bill:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE vendor bill
export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only ADMIN can delete
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.vendorBill.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Vendor bill deleted successfully" });
  } catch (error) {
    console.error('Error deleting vendor bill:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
