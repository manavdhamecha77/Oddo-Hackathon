import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/roleGuard";
import { NextResponse } from "next/server";

// GET all vendor bills
export async function GET(req) {
  try {
    const userToken = await getUserFromRequest(req);
    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userToken.id },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only sales_finance and admin roles can access vendor bills
    if (user.role.name !== "sales_finance" && user.role.name !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if filtering by projectId
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    const where = {};
    if (projectId) {
      where.projectId = parseInt(projectId);
    }

    const vendorBills = await prisma.vendorBill.findMany({
      where,
      include: {
        project: true,
        vendor: true,
        purchaseOrder: true,
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vendorBills);
  } catch (error) {
    console.error("Error fetching vendor bills:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new vendor bill
export async function POST(req) {
  try {
    const userToken = await getUserFromRequest(req);
    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userToken.id },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only sales_finance and admin roles can create vendor bills
    if (user.role.name !== "sales_finance" && user.role.name !== "admin") {
      return NextResponse.json({ error: "Access denied: Sales & Finance role required" }, { status: 403 });
    }

    const { projectId, vendorId, purchaseOrderId, billDate, dueDate, status, notes, lines, totalAmount } = await req.json();

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor is required" }, { status: 400 });
    }

    if (!lines || lines.length === 0) {
      return NextResponse.json({ error: "At least one bill line is required" }, { status: 400 });
    }

    // Generate bill number
    const billCount = await prisma.vendorBill.count();
    const billNumber = `VB-${String(billCount + 1).padStart(5, '0')}`;

    // Create vendor bill with lines
    const vendorBill = await prisma.vendorBill.create({
      data: {
        billNumber,
        projectId: projectId ? parseInt(projectId) : null,
        vendorId: parseInt(vendorId),
        purchaseOrderId: purchaseOrderId ? parseInt(purchaseOrderId) : null,
        billDate: new Date(billDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || "draft",
        totalAmount: parseFloat(totalAmount),
        notes: notes || null,
        createdBy: user.id,
        lines: {
          create: lines.map(line => ({
            productId: line.productId ? parseInt(line.productId) : null,
            description: line.description,
            quantity: parseFloat(line.quantity),
            unitPrice: parseFloat(line.unitPrice),
          })),
        },
      },
      include: {
        project: true,
        vendor: true,
        purchaseOrder: true,
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(vendorBill, { status: 201 });
  } catch (error) {
    console.error("Error creating vendor bill:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
