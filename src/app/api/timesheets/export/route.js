import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET export timesheets to CSV
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const billableOnly = searchParams.get('billableOnly');

    // Build where clause
    const whereClause = {
      userId: user.id
    };

    // Apply filters
    if (projectId) {
      whereClause.projectId = parseInt(projectId);
    }

    if (startDate || endDate) {
      whereClause.workDate = {};
      if (startDate) {
        whereClause.workDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.workDate.lte = new Date(endDate);
      }
    }

    if (billableOnly === 'true') {
      whereClause.isBillable = true;
    }

    // Fetch timesheet data
    const timesheets = await prisma.timesheet.findMany({
      where: whereClause,
      include: {
        task: {
          select: { title: true }
        },
        project: {
          select: { name: true }
        }
      },
      orderBy: { workDate: 'desc' }
    });

    // Generate CSV content
    const headers = [
      'Date',
      'Project',
      'Task',
      'Hours',
      'Hourly Rate',
      'Total Value',
      'Billable',
      'Description'
    ];

    const csvRows = [headers.join(',')];

    timesheets.forEach(entry => {
      const row = [
        `"${new Date(entry.workDate).toISOString().split('T')[0]}"`,
        `"${entry.project?.name || 'N/A'}"`,
        `"${entry.task?.title || 'N/A'}"`,
        entry.hours.toString(),
        entry.hourlyRate.toString(),
        (parseFloat(entry.hours) * parseFloat(entry.hourlyRate)).toFixed(2),
        entry.isBillable ? 'Yes' : 'No',
        `"${entry.description || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `timesheets_${user.firstName || 'user'}_${currentDate}.csv`;

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Error exporting timesheets:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}