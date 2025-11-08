import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getUserFromRequest(req) {
  try {
    const token = req.cookies.get("token")?.value; // ✅ works with App Router
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    
    // CRITICAL: Get user's companyId from database to ensure data isolation
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { 
        id: true, 
        email: true, 
        companyId: true,
        role: {
          select: { name: true }
        }
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role.name
    };
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

/**
 * CRITICAL SECURITY FUNCTION
 * Validates that a resource belongs to the user's company
 * Prevents cross-company data access
 */
export async function validateCompanyAccess(user, model, resourceId) {
  if (!user || !user.companyId) return false;
  
  try {
    const resource = await prisma[model].findUnique({
      where: { id: resourceId },
      include: {
        // Adjust based on model - this is a generic approach
        user: { select: { companyId: true } }
      }
    });

    if (!resource) return false;
    
    // Check if resource belongs to same company
    return resource.user?.companyId === user.companyId;
  } catch (error) {
    console.error('Company access validation error:', error);
    return false;
  }
}
