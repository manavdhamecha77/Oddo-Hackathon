import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { name, email, password, roleName } = await req.json();

    // check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return NextResponse.json({ error: "User already exists" }, { status: 400 });

    // find role, or fallback to default "User"
    const role = await prisma.role.findUnique({
      where: { name: "User" }, // default role for signup
    });

    if (!role)
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user with relation
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: { connect: { id: role.id } },
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
