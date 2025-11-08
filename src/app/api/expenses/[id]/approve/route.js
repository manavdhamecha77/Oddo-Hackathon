import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST approve/reject expense
export async function POST(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only Project Managers and Admins can approve expenses
    const userRole = user.role?.toUpperCase();
    if (!['PROJECT_MANAGER', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden: Only Project Managers and Admins can approve expenses" }, { status: 403 });
    }

    const { id } = await params;
    const { action, notes } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 'approve' or 'reject'" }, { status: 400 });
    }

    const expense = await prisma.expense.update({
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
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        approver: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error approving/rejecting expense:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
