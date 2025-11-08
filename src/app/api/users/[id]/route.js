import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single user
export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only admins can view other users
    const userRole = user.role?.toUpperCase();
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const userData = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        hourlyRate: true,
        isActive: true,
        role: {
          select: { id: true, name: true, description: true }
        },
        company: {
          select: { id: true, name: true }
        }
      }
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure user is from same company
    if (userData.company.id !== user.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH update user
export async function PATCH(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only admins can update users
    const userRole = user.role?.toUpperCase();
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden: Only admins can update user information" }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();

    // Verify the user to update exists and is in the same company
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, companyId: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.companyId !== user.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prepare update data
    const updateData = {};
    
    if (data.hourlyRate !== undefined) {
      const rate = parseFloat(data.hourlyRate);
      if (isNaN(rate) || rate < 0) {
        return NextResponse.json({ error: "Invalid hourly rate" }, { status: 400 });
      }
      updateData.hourlyRate = rate;
    }

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        hourlyRate: true,
        isActive: true,
        role: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
