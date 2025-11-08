import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { name, email, password, roleName } = await req.json();

    // check if user already exists
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser)
      return NextResponse.json({ error: "User already exists" }, { status: 400 });

    // find role, default to "team_member" which exists in seed/schema
    const defaultRoleName = "team_member";
    const role = await prisma.roles.findUnique({
      where: { name: roleName || defaultRoleName },
    });

    if (!role)
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    // hash password -> store into password_hash (schema field)
    const password_hash = await bcrypt.hash(password, 10);

    // split name into first/last (best-effort)
    const [firstName, ...rest] = (name || "").trim().split(" ");
    const lastName = rest.join(" ") || null;

    // create user with relation
    const user = await prisma.users.create({
      data: {
        email,
        password_hash,
        first_name: firstName || null,
        last_name: lastName,
        roles: { connect: { id: role.id } },
      },
      include: { roles: true },
    });

    return NextResponse.json(
      { message: "User registered successfully", user: { id: user.id, email: user.email, role: user.roles.name, firstName: user.first_name, lastName: user.last_name } },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 }); // 409 Conflict
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
