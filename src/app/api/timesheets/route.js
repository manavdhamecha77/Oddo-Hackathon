import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all timesheets
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
    const timesheets = await prisma.timesheet.findMany({
      where: whereClause,
      include: {
        task: {
          include: {
            project: true
          }
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { workDate: 'desc' }
    });

    return NextResponse.json(timesheets);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
