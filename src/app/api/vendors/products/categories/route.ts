import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { eq } from "drizzle-orm";

export async function GET() {
    const categories = await db
        .selectDistinct({
            occupation: vendorProductsTable.occupation,
        })
        .from(vendorProductsTable)
        .where(eq(vendorProductsTable.isActive, true))
        .orderBy(vendorProductsTable.occupation);

    return NextResponse.json({
        categories: categories.map((c) => c.occupation),
    });
}
