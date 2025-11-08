import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/roleGuard";
import { NextResponse } from "next/server";

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

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        companyId: user.companyId,
        status: "pending",
      },
    });

    if (existingInvitation) {
      return NextResponse.json({ error: "Invitation already sent to this email" }, { status: 400 });
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        email,
        companyId: user.companyId,
        roleId,
        invitedBy: user.id,
        expiresAt,
        status: "pending",
      },
      include: {
        role: true,
        company: true,
      },
    });

    // In a real app, send email with invitation link here
    // const inviteLink = `${process.env.APP_URL}/invite/${invitation.token}`;
    // await sendEmail(email, inviteLink);

    return NextResponse.json({
      message: "Invitation sent successfully",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        token: invitation.token,
        role: invitation.role.name,
        expiresAt: invitation.expiresAt,
        inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${invitation.token}`,
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

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Get invitations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
