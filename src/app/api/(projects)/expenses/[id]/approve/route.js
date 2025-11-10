import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST approve/reject expense
export async function POST(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { action, notes } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 'approve' or 'reject'" }, { status: 400 });
    }

    // Fetch the expense with the submitter's role
    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          include: {
            role: true
          }
        }
      }
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const userRole = user.role?.toUpperCase();
    const submitterRole = expense.user.role.name?.toUpperCase();

    // Role-based approval logic:
    // 1. Admin can approve all expenses
    // 2. Project Managers can only approve Team Member expenses
    // 3. Sales/Finance can approve Project Manager and Admin expenses
    
    if (userRole === 'ADMIN') {
      // Admin can approve everything
    } else if (userRole === 'PROJECT_MANAGER') {
      // Project Manager can only approve Team Member expenses
      if (submitterRole !== 'TEAM_MEMBER') {
        return NextResponse.json({ 
          error: "Forbidden: Project Managers can only approve Team Member expenses. This expense must be approved by Sales/Finance." 
        }, { status: 403 });
      }
    } else if (userRole === 'SALES_FINANCE') {
      // Sales/Finance can approve Project Manager and Admin expenses
      if (submitterRole === 'TEAM_MEMBER') {
        return NextResponse.json({ 
          error: "Forbidden: Sales/Finance cannot approve Team Member expenses. These must be approved by Project Managers." 
        }, { status: 403 });
      }
    } else {
      return NextResponse.json({ 
        error: "Forbidden: You don't have permission to approve expenses" 
      }, { status: 403 });
    }

    // Prevent users from approving their own expenses
    if (expense.userId === user.id) {
      return NextResponse.json({ 
        error: "Forbidden: You cannot approve your own expenses" 
      }, { status: 403 });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedBy: user.id,
        approvedAt: new Date(),
        notes: notes || null
      },
      include: {
        project: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: { select: { name: true } } }
        },
        approver: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('Error approving/rejecting expense:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
