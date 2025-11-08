import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all partners (customers and vendors)
export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'customer', 'vendor', or 'both'

    // Build where clause
    const whereClause = {};

    // Filter by type if provided
    if (type && ['customer', 'vendor', 'both'].includes(type)) {
      if (type === 'customer') {
        whereClause.type = { in: ['customer', 'both'] };
      } else if (type === 'vendor') {
        whereClause.type = { in: ['vendor', 'both'] };
      } else {
        whereClause.type = 'both';
      }
    }

    const partners = await prisma.partner.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new partner
export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role
    if (!['PROJECT_MANAGER', 'SALES_FINANCE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, type, email, phone, address } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ error: "Missing required fields: name and type" }, { status: 400 });
    }

    if (!['customer', 'vendor', 'both'].includes(type)) {
      return NextResponse.json({ error: "Invalid type. Must be 'customer', 'vendor', or 'both'" }, { status: 400 });
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        type,
        email: email || null,
        phone: phone || null,
        address: address || null
      }
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
