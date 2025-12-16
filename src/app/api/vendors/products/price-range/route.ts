// src/app/api/vendors/products/price-range/route.ts
import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
    try {
        const [result] = await db
            .select({
                minPrice: sql<number>`
                    MIN(
                        LEAST(
                            ${vendorProductsTable.basePriceSingleDay},
                            ${vendorProductsTable.basePriceMultiDay}
                        )
                    )
                `,
                maxPrice: sql<number>`
                    MAX(
                        GREATEST(
                            ${vendorProductsTable.basePriceSingleDay},
                            ${vendorProductsTable.basePriceMultiDay}
                        )
                    )
                `,
            })
            .from(vendorProductsTable)
            .innerJoin(
                vendorsTable,
                eq(vendorProductsTable.vendorId, vendorsTable.id)
            )
            .where(
                eq(vendorProductsTable.isActive, true)
            );

        return NextResponse.json({
            minPrice: Number(result?.minPrice ?? 0),
            maxPrice: Number(result?.maxPrice ?? 0),
        });
    } catch (error) {
        console.error("Price Range Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch price range" },
            { status: 500 }
        );
    }
}
