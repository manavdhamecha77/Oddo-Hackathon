import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all vendor bills
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // CRITICAL: Filter by companyId to prevent cross-company data access
    const vendorBills = await prisma.vendorBill.findMany({
      where: {
        project: {
          projectManager: {
            companyId: user.companyId
          }
        }
      },
      include: {
        project: true,
        lines: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(vendorBills);
  } catch (error) {
    console.error('Error fetching vendor bills:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new vendor bill
export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    if (!['PROJECT_MANAGER', 'SALES_FINANCE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { projectId, billNumber, vendorName, billDate, dueDate, totalAmount, status, lines } = await req.json();

    if (!projectId || !billNumber || !vendorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // CRITICAL: Verify project belongs to user's company
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        projectManager: { select: { companyId: true } }
      }
    });

    if (!project || project.projectManager.companyId !== user.companyId) {
      return NextResponse.json({ error: "Forbidden: Invalid company access" }, { status: 403 });
    }

    const vendorBill = await prisma.vendorBill.create({
      data: {
        billNumber,
        vendorName,
        billDate: billDate ? new Date(billDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
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

    return NextResponse.json(vendorBill, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor bill:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
