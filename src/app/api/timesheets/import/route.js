import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST import timesheets from CSV
export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read and parse CSV content
    const csvContent = await file.text();
    const rows = csvContent.split('\n').map(row => row.trim()).filter(row => row);
    
    if (rows.length < 2) {
      return NextResponse.json({ error: "CSV file must contain a header row and at least one data row" }, { status: 400 });
    }

    // Parse header row
    const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
    const expectedHeaders = ['project_name', 'task_title', 'work_date', 'hours', 'is_billable', 'description'];
    
    // Validate headers
    const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required headers: ${missingHeaders.join(', ')}`,
        expected: expectedHeaders,
        received: headers
      }, { status: 400 });
    }

    const results = {
      imported: 0,
      errors: [],
      skipped: 0
    };

    // Get user's hourly rate
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { hourlyRate: true }
    });

    // Process each data row
    for (let i = 1; i < rows.length; i++) {
      const rowData = rows[i].split(',').map(cell => cell.trim());
      
      if (rowData.length < expectedHeaders.length) {
        results.errors.push(`Row ${i + 1}: Insufficient columns`);
        continue;
      }

      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header] = rowData[index] || '';
      });

      try {
        // Validate and parse data
        const projectName = rowObject.project_name?.replace(/"/g, '');
        const taskTitle = rowObject.task_title?.replace(/"/g, '');
        const workDate = rowObject.work_date?.replace(/"/g, '');
        const hours = parseFloat(rowObject.hours?.replace(/"/g, '') || '0');
        const isBillable = rowObject.is_billable?.replace(/"/g, '').toLowerCase() === 'true' || 
                          rowObject.is_billable?.replace(/"/g, '').toLowerCase() === 'yes' || 
                          rowObject.is_billable?.replace(/"/g, '') === '1';
        const description = rowObject.description?.replace(/"/g, '') || null;

        // Validate required fields
        if (!projectName || !taskTitle || !workDate || !hours || hours <= 0) {
          results.errors.push(`Row ${i + 1}: Missing required fields or invalid hours`);
          continue;
        }

        // Validate date format
        const parsedDate = new Date(workDate);
        if (isNaN(parsedDate.getTime())) {
          results.errors.push(`Row ${i + 1}: Invalid date format. Use YYYY-MM-DD`);
          continue;
        }

        // Validate hours
        if (hours > 24) {
          results.errors.push(`Row ${i + 1}: Hours cannot exceed 24`);
          continue;
        }

        // Find project by name (within user's company)
        const project = await prisma.project.findFirst({
          where: { 
            name: projectName,
            OR: [
              { members: { some: { userId: user.id } } },
              { projectManagerId: user.id }
            ]
          },
          select: { id: true, name: true }
        });

        if (!project) {
          results.errors.push(`Row ${i + 1}: Project "${projectName}" not found or access denied`);
          continue;
        }

        // Find task by title within the project
        const task = await prisma.task.findFirst({
          where: { 
            title: taskTitle,
            projectId: project.id
          },
          select: { id: true, title: true, projectId: true }
        });

        if (!task) {
          results.errors.push(`Row ${i + 1}: Task "${taskTitle}" not found in project "${projectName}"`);
          continue;
        }

        // Check if timesheet entry already exists for this date/task/user
        const existingEntry = await prisma.timesheet.findFirst({
          where: {
            userId: user.id,
            taskId: task.id,
            workDate: parsedDate
          }
        });

        if (existingEntry) {
          results.errors.push(`Row ${i + 1}: Timesheet entry already exists for this date and task`);
          continue;
        }

        // Create timesheet entry
        await prisma.timesheet.create({
          data: {
            taskId: task.id,
            userId: user.id,
            projectId: project.id,
            workDate: parsedDate,
            hours: hours,
            isBillable: isBillable,
            hourlyRate: userData?.hourlyRate || 0,
            description: description
          }
        });

        results.imported++;

      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      results: results,
      message: `Import completed. ${results.imported} entries imported, ${results.errors.length} errors.`
    });

  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// GET download CSV template
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const csvTemplate = `project_name,task_title,work_date,hours,is_billable,description
"Sample Project","Sample Task","2024-01-15",8.00,true,"Working on feature development"
"Sample Project","Bug Fix","2024-01-16",2.50,true,"Fixed critical bug in user authentication"
"Internal Project","Team Meeting","2024-01-17",1.00,false,"Weekly team standup meeting"`;

    return new Response(csvTemplate, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="timesheet_template.csv"'
      }
    });

  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}