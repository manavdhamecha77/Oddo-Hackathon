import { NextResponse } from 'next/server';
import { addTaskComment, getTaskComments } from '@/lib/taskHelpers';

export async function GET(request, { params }) {
  try {
    const comments = await getTaskComments(parseInt(params.id));
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { userId, comment } = await request.json();
    const newComment = await addTaskComment(parseInt(params.id), userId, comment);
    return NextResponse.json({ success: true, comment: newComment }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
