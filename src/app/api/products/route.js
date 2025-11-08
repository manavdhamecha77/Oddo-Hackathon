import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/roleGuard";
import { NextResponse } from "next/server";

// GET all products
export async function GET(req) {
  try {
    const userToken = await getUserFromRequest(req);
    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new product
export async function POST(req) {
  try {
    const userToken = await getUserFromRequest(req);
    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, unitPrice, costPrice, isService } = await req.json();

    if (!name || unitPrice === undefined) {
      return NextResponse.json({ error: "Name and unit price are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        unitPrice: parseFloat(unitPrice),
        costPrice: costPrice ? parseFloat(costPrice) : null,
        isService: isService || false,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
