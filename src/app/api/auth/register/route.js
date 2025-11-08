import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return NextResponse.json({ error: "User already exists" }, { status: 400 });

    // Assign "admin" role by default for new registrations
    const defaultRoleName = "admin";
    const role = await prisma.role.findUnique({
      where: { name: defaultRoleName },
    });

    if (!role)
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    // hash password -> store into passwordHash (schema field)
    const passwordHash = await bcrypt.hash(password, 10);

    // split name into first/last (best-effort)
    const [firstName, ...rest] = (name || "").trim().split(" ");
    const lastName = rest.join(" ") || null;

    // create user with relation
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName || null,
        lastName,
        role: { connect: { id: role.id } },
      },
      include: { role: true },
    });

    // Generate JWT token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(secret);

    const res = NextResponse.json(
      { 
        message: "User registered successfully", 
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role.name, 
          firstName: user.firstName, 
          lastName: user.lastName 
        } 
      },
      { status: 201 }
    );

    // Set token as httpOnly cookie
    res.cookies.set("token", token, { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 }); // 409 Conflict
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
