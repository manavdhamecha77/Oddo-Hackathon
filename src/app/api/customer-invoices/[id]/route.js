import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single customer invoice
export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: true,
        lines: true,
        customer: true,
        salesOrder: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Customer invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching customer invoice:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update customer invoice
export async function PUT(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    if (!['PROJECT_MANAGER', 'SALES_FINANCE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { invoiceNumber, customerName, invoiceDate, dueDate, totalAmount, status } = await req.json();

    const updatedInvoice = await prisma.customerInvoice.update({
      where: { id: parseInt(id) },
      data: {
        ...(invoiceNumber && { invoiceNumber }),
        ...(customerName && { customerName }),
        ...(invoiceDate && { invoiceDate: new Date(invoiceDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(totalAmount !== undefined && { totalAmount: parseFloat(totalAmount) }),
        ...(status && { status })
      },
      include: {
        project: true,
        lines: true,
        customer: true,
        salesOrder: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating customer invoice:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE customer invoice
export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only ADMIN can delete
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.customerInvoice.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Customer invoice deleted successfully" });
  } catch (error) {
    console.error('Error deleting customer invoice:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
