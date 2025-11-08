import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single purchase order
export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectManager: {
              select: {
                companyId: true
              }
            }
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
      }
    });

    if (!purchaseOrder) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    // CRITICAL: Verify user has access to this PO's project
    if (purchaseOrder.project.projectManager.companyId !== user.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    const { id } = await params;
    const { orderNumber, vendorId, orderDate, totalAmount, status, notes, lines } = await req.json();

    // Verify PO exists and user has access
    const existingPO = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: {
          select: {
            projectManager: {
              select: { companyId: true }
            }
          }
        }
      }
    });

    if (!existingPO) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    if (existingPO.project.projectManager.companyId !== user.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update purchase order with lines in a transaction
    const updatedPurchaseOrder = await prisma.$transaction(async (tx) => {
      // Delete existing lines
      await tx.purchaseOrderLine.deleteMany({
        where: { purchaseOrderId: parseInt(id) }
      });

      // Update PO with new lines
      return await tx.purchaseOrder.update({
        where: { id: parseInt(id) },
        data: {
          ...(orderNumber && { orderNumber }),
          ...(vendorId && { vendorId: parseInt(vendorId) }),
          ...(orderDate && { orderDate: new Date(orderDate) }),
          ...(totalAmount !== undefined && { totalAmount: parseFloat(totalAmount) }),
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
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

    const { id } = await params;
    await prisma.purchaseOrder.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Purchase order deleted successfully" });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
