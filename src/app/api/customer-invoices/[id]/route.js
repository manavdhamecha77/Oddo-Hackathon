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
    if (!['project_manager', 'sales_finance', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { invoiceNumber, customerId, salesOrderId, invoiceDate, dueDate, totalAmount, status, notes, lines } = await req.json();

    // Ensure the invoice belongs to the same company as the user via project link
    const existing = await prisma.customerInvoice.findUnique({
      where: { id: parseInt(id) },
      include: { project: { include: { projectManager: { select: { companyId: true } } } } }
    });
    if (!existing || existing.project?.projectManager?.companyId !== user.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedInvoice = await prisma.customerInvoice.update({
      where: { id: parseInt(id) },
      data: {
        ...(invoiceNumber && { invoiceNumber }),
        ...(customerId && { customerId: parseInt(customerId) }),
        ...(salesOrderId !== undefined && { salesOrderId: salesOrderId ? parseInt(salesOrderId) : null }),
        ...(invoiceDate && { invoiceDate: new Date(invoiceDate) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(totalAmount !== undefined && { totalAmount: parseFloat(totalAmount) }),
        ...(status && { status }),
        ...(notes !== undefined && { notes })
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

    // Replace lines if provided
    if (Array.isArray(lines)) {
      await prisma.customerInvoiceLine.deleteMany({ where: { invoiceId: updatedInvoice.id } });
      await prisma.customerInvoiceLine.createMany({
        data: lines.map(line => ({
          invoiceId: updatedInvoice.id,
          description: line.description,
          quantity: parseFloat(line.quantity),
          unitPrice: parseFloat(line.unitPrice)
        }))
      });
    }

    const refreshed = await prisma.customerInvoice.findUnique({
      where: { id: parseInt(id) },
      include: { project: true, customer: true, salesOrder: true, lines: true, creator: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });

    return NextResponse.json(refreshed);
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
    if (user.role !== 'admin') {
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
