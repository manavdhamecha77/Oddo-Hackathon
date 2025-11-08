import { NextResponse } from 'next/server';
import { createTask, getTasksByProject, getTasksByUser } from '@/lib/taskHelpers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');

    let tasks;
    if (projectId) {
      tasks = await getTasksByProject(parseInt(projectId));
    } else if (userId) {
      tasks = await getTasksByUser(parseInt(userId));
    } else {
      return NextResponse.json({ error: 'projectId or userId required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const task = await createTask(body);
    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
