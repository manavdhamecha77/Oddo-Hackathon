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

    const allUsers = await prisma.user.findMany({
      where: { companyId: user.companyId },
      include: { role: true },
    });

    const stats = {
      totalMembers: allUsers.length,
      projectManagers: allUsers.filter(u => u.role.name === 'project_manager').length,
      teamMembers: allUsers.filter(u => u.role.name === 'team_member').length,
      salesFinance: allUsers.filter(u => u.role.name === 'sales_finance').length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
