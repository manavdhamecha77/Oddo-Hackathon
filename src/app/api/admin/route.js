import { getUserFromRequest, requireRole } from "@/lib/roleGuard";
import { NextResponse } from "next/server";

export async function GET(req) {
  const user = await getUserFromRequest(req);
  if (!requireRole(user, ["admin"])) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // proceed with admin logic
}
