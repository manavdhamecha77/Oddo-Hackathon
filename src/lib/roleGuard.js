import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getUserFromRequest(req) {
  try {
    const token = req.cookies.get("token")?.value; // ✅ works with App Router
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    return payload; // { id, email, role }
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

export function requireRole(user, allowed = []) {
  if (!user) return false;
  if (allowed.length === 0) return true;
  return allowed.includes(user.role);
}
