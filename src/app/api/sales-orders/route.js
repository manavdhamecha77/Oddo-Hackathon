import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/roleGuard";
import { NextResponse } from "next/server";

// GET all sales orders
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

    // Only sales_finance role can access sales orders
    if (user.role.name !== "sales_finance" && user.role.name !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const salesOrders = await prisma.salesOrder.findMany({
      include: {
        project: true,
        customer: true,
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

    return NextResponse.json(salesOrders);
  } catch (error) {
    console.error("Error fetching sales orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new sales order
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

    // Only sales_finance role can create sales orders
    if (user.role.name !== "sales_finance" && user.role.name !== "admin") {
      return NextResponse.json({ error: "Access denied: Sales & Finance role required" }, { status: 403 });
    }

    const { projectId, customerId, orderDate, status, notes, lines, totalAmount } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "Customer is required" }, { status: 400 });
    }

    if (!lines || lines.length === 0) {
      return NextResponse.json({ error: "At least one order line is required" }, { status: 400 });
    }

    // Generate order number
    const orderCount = await prisma.salesOrder.count();
    const orderNumber = `SO-${String(orderCount + 1).padStart(5, '0')}`;

    // Create sales order with lines
    const salesOrder = await prisma.salesOrder.create({
      data: {
        orderNumber,
        projectId: projectId ? parseInt(projectId) : null,
        customerId: parseInt(customerId),
        orderDate: new Date(orderDate),
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
        customer: true,
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

    return NextResponse.json(salesOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating sales order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
