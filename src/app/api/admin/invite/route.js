import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/roleGuard";
import { NextResponse } from "next/server";
import { generateRandomPassword } from "@/lib/password";
import { sendWelcomeEmail } from "@/lib/mailer";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    // Verify user is admin
    const userToken = await getUserFromRequest(req);
    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userToken.id },
      include: { role: true, company: true },
    });

    if (!user || user.role.name !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { email, roleId } = await req.json();

    if (!email || !roleId) {
      return NextResponse.json({ error: "Email and roleId are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // Generate random password
    const randomPassword = generateRandomPassword(12);
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    // Create user and invitation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user immediately
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          companyId: user.companyId,
          roleId,
        },
        include: {
          role: true,
          company: true,
        },
      });

      // Create invitation record for tracking
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitation = await tx.invitation.create({
        data: {
          email,
          companyId: user.companyId,
          roleId,
          invitedBy: user.id,
          expiresAt,
          status: "accepted", // Mark as accepted since user is created
          acceptedAt: new Date(),
        },
        include: {
          role: true,
          company: true,
        },
      });

      return { newUser, invitation };
    });

    // Send welcome email with credentials
    const emailResult = await sendWelcomeEmail({
      to: result.newUser.email,
      companyId: result.newUser.company.companyId,
      companyName: result.newUser.company.name,
      email: result.newUser.email,
      password: randomPassword,
      role: result.newUser.role.name,
    });

    return NextResponse.json({
      message: emailResult.success 
        ? "User created and credentials sent via email" 
        : "User created (email sending failed)",
      emailSent: emailResult.success,
      user: {
        id: result.newUser.id,
        email: result.newUser.email,
        role: result.newUser.role.name,
        companyId: result.newUser.company.companyId,
        companyName: result.newUser.company.name,
        password: randomPassword, // Still send to admin as backup
      },
    });
  } catch (error) {
    console.error("Invitation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get all invitations for the admin's company
export async function GET(req) {
  try {
    const userToken = await getUserFromRequest(req);
    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userToken.id },
      include: { role: true },
    });

    if (!user || user.role.name !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const invitations = await prisma.invitation.findMany({
      where: { companyId: user.companyId },
      include: { role: true },
      orderBy: { createdAt: "desc" },
    });

    // Get user data for all invitations
    const invitationsWithUsers = await Promise.all(
      invitations.map(async (inv) => {
        // Find the user by email and company
        const createdUser = await prisma.user.findFirst({
          where: {
            email: inv.email,
            companyId: user.companyId,
          },
          select: { id: true },
        });
        return { ...inv, userId: createdUser?.id || null };
      })
    );

    return NextResponse.json({ invitations: invitationsWithUsers });
  } catch (error) {
    console.error("Get invitations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
