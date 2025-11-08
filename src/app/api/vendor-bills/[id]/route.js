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
        vendor: true,
        purchaseOrder: true,
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
    if (!['project_manager', 'sales_finance', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { billNumber, vendorId, purchaseOrderId, billDate, dueDate, totalAmount, status, notes, lines } = await req.json();

    // Ensure the bill belongs to the same company as the user via project link
    const existing = await prisma.vendorBill.findUnique({
      where: { id: parseInt(id) },
      include: { project: { include: { projectManager: { select: { companyId: true } } } } }
    });
    if (!existing || existing.project?.projectManager?.companyId !== user.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedVendorBill = await prisma.vendorBill.update({
      where: { id: parseInt(id) },
      data: {
        ...(billNumber && { billNumber }),
        ...(vendorId && { vendorId: parseInt(vendorId) }),
        ...(purchaseOrderId !== undefined && { purchaseOrderId: purchaseOrderId ? parseInt(purchaseOrderId) : null }),
        ...(billDate && { billDate: new Date(billDate) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(totalAmount !== undefined && { totalAmount: parseFloat(totalAmount) }),
        ...(status && { status }),
        ...(notes !== undefined && { notes })
      },
      include: {
        project: true,
        vendor: true,
        purchaseOrder: true,
        lines: true
      }
    });

    // Replace lines if provided
    if (Array.isArray(lines)) {
      await prisma.vendorBillLine.deleteMany({ where: { billId: updatedVendorBill.id } });
      await prisma.vendorBillLine.createMany({
        data: lines.map(line => ({
          billId: updatedVendorBill.id,
          description: line.description,
          quantity: parseFloat(line.quantity),
          unitPrice: parseFloat(line.unitPrice)
        }))
      });
    }

    const refreshed = await prisma.vendorBill.findUnique({
      where: { id: parseInt(id) },
      include: { project: true, vendor: true, purchaseOrder: true, lines: true }
    });

    return NextResponse.json(refreshed);
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
    if (user.role !== 'admin') {
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
