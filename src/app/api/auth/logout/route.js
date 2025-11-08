import { NextResponse } from "next/server";

export async function POST() {
  // Clear the JWT cookie
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set("token", "", { expires: new Date(0) }); // remove token
  return res;
}
