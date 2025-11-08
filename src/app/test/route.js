import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Test database connection by counting users
        const userCount = await prisma.users.count();

        // Get a sample user if any exist
        const sampleUser = await prisma.users.findFirst({
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role_id: true,
                is_active: true,
            }
        });

        // Get all tables to verify schema
        const projectCount = await prisma.projects.count();
        const partnerCount = await prisma.partners.count();

        return NextResponse.json({
            success: true,
            message: 'Database connection successful!',
            data: {
                userCount,
                projectCount,
                partnerCount,
                sampleUser,
                timestamp: new Date().toISOString(),
            }
        });
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json({
            success: false,
            message: 'Database connection failed',
            error: error.message,
        }, { status: 500 });
    }
}
