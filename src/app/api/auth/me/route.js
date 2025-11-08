import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  const userToken = await getUserFromRequest(req);
  if (!userToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userToken.id },
    include: { role: true }
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
  return NextResponse.json({ id: user.id, email: user.email, role: user.role?.name, name });
}
