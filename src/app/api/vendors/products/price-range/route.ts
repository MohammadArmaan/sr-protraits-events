// src/app/api/vendors/products/price-range/route.ts
import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq, min, max } from "drizzle-orm";

export async function GET() {
    const [result] = await db
        .select({
            minPrice: min(vendorProductsTable.basePrice),
            maxPrice: max(vendorProductsTable.basePrice),
        })
        .from(vendorProductsTable)
        .innerJoin(
            vendorsTable,
            eq(vendorProductsTable.vendorId, vendorsTable.id)
        )
        .where(eq(vendorProductsTable.isActive, true));

    return NextResponse.json({
        minPrice: Number(result.minPrice ?? 0),
        maxPrice: Number(result.maxPrice ?? 0),
    });
}
