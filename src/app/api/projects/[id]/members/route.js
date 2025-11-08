import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/roleGuard';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id]/members - Get all members of a project
export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const projectId = parseInt(id);

    // Verify project exists and belongs to user's company
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        projectManager: {
          companyId: user.companyId
        }
      },
      include: {
        projectManager: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: {
              select: {
                name: true
              }
            },
            hourlyRate: true,
            isActive: true
          },
        },
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    // If no project members, return all users from the same company
    if (members.length === 0) {
      const allUsers = await prisma.user.findMany({
        where: { 
          companyId: user.companyId,
          isActive: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
      return NextResponse.json(allUsers);
    }

    const users = members.map(m => m.user);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching project members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const projectId = parseInt(id);
    const { userId, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if member already exists
    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: parseInt(userId)
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: parseInt(userId),
        role: role || null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error adding project member:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const projectId = parseInt(id);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: parseInt(userId)
        }
      }
    });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing project member:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
