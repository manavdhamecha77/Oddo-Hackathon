import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  const userToken = await getUserFromRequest(req);
  if (!userToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { id: userToken.id },
    include: { roles: true }
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ 
    id: user.id, 
    email: user.email, 
    role: user.roles.name, 
    firstName: user.first_name,
    lastName: user.last_name 
  });
}
