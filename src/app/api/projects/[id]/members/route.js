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

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching project members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST /api/projects/[id]/members - Add a member to the project
export async function POST(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and PROJECT_MANAGER can add members
    if (!['ADMIN', 'PROJECT_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const projectId = parseInt(id);
    const body = await req.json();
    const { userId, role: memberRole } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify project exists and belongs to user's company
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        projectManager: {
          companyId: user.companyId
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify user exists and belongs to same company
    const targetUser = await prisma.user.findFirst({
      where: {
        id: parseInt(userId),
        companyId: user.companyId,
        isActive: true
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: parseInt(userId)
        }
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a project member' }, { status: 409 });
    }

    // Add member to project
    const projectMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: parseInt(userId),
        role: memberRole || null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: {
              select: {
                name: true
              }
            },
            hourlyRate: true,
            isActive: true
          }
        }
      }
    });

    return NextResponse.json(projectMember, { status: 201 });
  } catch (error) {
    console.error('Error adding project member:', error);
    return NextResponse.json({ error: 'Failed to add project member' }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/members?userId=123 - Remove a member from the project
export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and PROJECT_MANAGER can remove members
    if (!['ADMIN', 'PROJECT_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const projectId = parseInt(id);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify project exists and belongs to user's company
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        projectManager: {
          companyId: user.companyId
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if member exists
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: parseInt(userId)
        }
      }
    });

    if (!existingMember) {
      return NextResponse.json({ error: 'Project member not found' }, { status: 404 });
    }

    // Remove member from project
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: parseInt(userId)
        }
      }
    });

    return NextResponse.json({ message: 'Project member removed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error removing project member:', error);
    return NextResponse.json({ error: 'Failed to remove project member' }, { status: 500 });
  }
}
