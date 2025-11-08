import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Get invitation details by token
export async function GET(req, { params }) {
  try {
    const { token } = params;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { role: true, company: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "Invitation already used" }, { status: 400 });
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      // Update status to expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "expired" },
      });
      return NextResponse.json({ error: "Invitation expired" }, { status: 400 });
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        companyName: invitation.company.name,
        companyId: invitation.company.companyId,
        role: invitation.role.name,
      },
    });
  } catch (error) {
    console.error("Get invitation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Accept invitation and create user account
export async function POST(req, { params }) {
  try {
    const { token } = params;
    const { name, password } = await req.json();

    if (!name || !password) {
      return NextResponse.json({ error: "Name and password are required" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { role: true, company: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "Invitation already used" }, { status: 400 });
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "expired" },
      });
      return NextResponse.json({ error: "Invitation expired" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Split name into first/last
    const [firstName, ...rest] = (name || "").trim().split(" ");
    const lastName = rest.join(" ") || null;

    // Create user and update invitation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          passwordHash,
          firstName: firstName || null,
          lastName,
          companyId: invitation.companyId,
          roleId: invitation.roleId,
        },
        include: { role: true, company: true },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: "accepted",
          acceptedAt: new Date(),
        },
      });

      return user;
    });

    // Generate JWT token
    const jwtToken = await new SignJWT({
      id: result.id,
      email: result.email,
      role: result.role.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(secret);

    const res = NextResponse.json({
      message: "Account created successfully",
      token: jwtToken,
      user: {
        id: result.id,
        email: result.email,
        role: result.role.name,
        firstName: result.firstName,
        lastName: result.lastName,
        companyId: result.company.companyId,
        companyName: result.company.name,
      },
    });

    // Set token as httpOnly cookie
    res.cookies.set("token", jwtToken, { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch (error) {
    console.error("Accept invitation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
