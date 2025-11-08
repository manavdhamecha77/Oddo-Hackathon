import { NextResponse } from 'next/server';
import { logTaskHours, getTaskTimesheets } from '@/lib/taskHelpers';

export async function GET(request, { params }) {
  try {
    const timesheets = await getTaskTimesheets(parseInt(params.id));
    return NextResponse.json({ success: true, timesheets });
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const timesheet = await logTaskHours({
      ...body,
      taskId: parseInt(params.id)
    });
    return NextResponse.json({ success: true, timesheet }, { status: 201 });
  } catch (error) {
    console.error('Error logging hours:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
