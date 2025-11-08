import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Role-based route prefixes
const roleRoutes = {
  admin: "/admin",
  project_manager: "/project_manager",
  team_member: "/team_member",
  sales_finance: "/sales_finance"
};

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const { payload } = await jwtVerify(token, secret);
    const userRole = payload.role;

    // Check if user is accessing a role-based route
    for (const [role, prefix] of Object.entries(roleRoutes)) {
      if (req.nextUrl.pathname.startsWith(prefix)) {
        // If user's role doesn't match the route, redirect to their dashboard
        if (userRole !== role) {
          const userDashboard = roleRoutes[userRole] + "/dashboard";
          return NextResponse.redirect(new URL(userDashboard, req.url));
        }
      }
    }

    // Handle old /dashboard routes - redirect to role-based dashboard
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      const roleDashboard = roleRoutes[userRole] + "/dashboard" + req.nextUrl.pathname.substring("/dashboard".length);
      return NextResponse.redirect(new URL(roleDashboard, req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/admin/:path*",
    "/project_manager/:path*",
    "/team_member/:path*",
    "/sales_finance/:path*"
  ],
};
