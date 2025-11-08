import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/roleGuard';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const userToken = await getUserFromRequest(req);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userToken.id },
      include: { role: true },
    });

    if (!user || user.role.name !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get role filter from query params
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get('role');

    // Build where clause
    const whereClause = { 
      companyId: user.companyId,
      NOT: { id: user.id } // Exclude the admin themselves
    };

    // Add role filter if provided
    if (roleFilter) {
      const roleIds = roleFilter.split(',').map(id => parseInt(id));
      whereClause.roleId = { in: roleIds };
    }

    // Fetch all users from the same company except the admin
    const users = await prisma.user.findMany({
      where: whereClause,
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}