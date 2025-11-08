import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all customer invoices
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // CRITICAL: Filter by companyId to prevent cross-company data access
    const invoices = await prisma.customerInvoice.findMany({
      where: {
        project: {
          projectManager: {
            companyId: user.companyId
          }
        }
      },
      include: {
        project: true,
        lines: true,
        billingTransactions: {
          include: {
            timesheet: true,
            expense: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching customer invoices:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new customer invoice
export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    if (!['PROJECT_MANAGER', 'SALES_FINANCE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { projectId, invoiceNumber, customerName, invoiceDate, dueDate, totalAmount, status, lines } = await req.json();

    if (!projectId || !invoiceNumber || !customerName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const invoice = await prisma.customerInvoice.create({
      data: {
        invoiceNumber,
        customerName,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
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

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating customer invoice:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
