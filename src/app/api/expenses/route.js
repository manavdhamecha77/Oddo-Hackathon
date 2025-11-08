import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all expenses
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const billed = searchParams.get('billed');

    // Build where clause
    const whereClause = {
      user: {
        companyId: user.companyId
      }
    };

    // Filter by project if provided
    if (projectId) {
      whereClause.projectId = parseInt(projectId);
    }

    // Filter by billed status if provided
    if (billed !== null) {
      whereClause.isBilled = billed === 'true';
    }

    // CRITICAL: Filter by companyId to prevent cross-company data access
    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        project: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { expenseDate: 'desc' }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new expense
export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, description, amount, date, category, receiptUrl } = await req.json();

    if (!projectId || !description || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // CRITICAL: Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      select: { id: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Generate unique expense number
    const expenseNumber = `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const expense = await prisma.expense.create({
      data: {
        expenseNumber,
        description,
        amount: parseFloat(amount),
        expenseDate: date ? new Date(date) : new Date(),
        category: category || 'Other',
        receiptPath: receiptUrl || null,
        isBillable: true,
        status: 'submitted',
        projectId: parseInt(projectId),
        userId: user.id
      },
      include: {
        project: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
