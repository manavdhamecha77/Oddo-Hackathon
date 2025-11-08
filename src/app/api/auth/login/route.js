import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    
    const user = await prisma.users.findUnique({ 
      where: { email }, 
      include: { roles: true } 
    });

    // Compare against password_hash (schema uses password_hash field)
    if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.roles?.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(secret);

    const res = NextResponse.json({ message: "Login successful", token });
    res.cookies.set("token", token, { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: "Login failed: " + error.message }, { status: 500 });
  }
}
