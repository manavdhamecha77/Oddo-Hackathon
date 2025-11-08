import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  const { companyId, email, password } = await req.json();

  if (!companyId || !email || !password) {
    return NextResponse.json({ error: "Company ID, email, and password are required" }, { status: 400 });
  }

  // Find user with company relation
  const user = await prisma.user.findUnique({ 
    where: { email }, 
    include: { role: true, company: true } 
  });

  // Validate user exists, password matches, and company ID matches
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Verify company ID matches
  if (user.company.companyId !== companyId) {
    return NextResponse.json({ error: "Invalid company ID" }, { status: 401 });
  }

  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role?.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(secret);

  const res = NextResponse.json({ message: "Login successful", token });
  res.cookies.set("token", token, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
