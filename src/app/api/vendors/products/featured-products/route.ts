import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq, and } from "drizzle-orm";

export async function GET() {
    try {
        const rows = await db
            .select({
                id: vendorProductsTable.id,
                uuid: vendorProductsTable.uuid,
                title: vendorProductsTable.title,

                basePriceSingleDay: vendorProductsTable.basePriceSingleDay,
                basePriceMultiDay: vendorProductsTable.basePriceMultiDay,

                advanceType: vendorProductsTable.advanceType,
                advanceValue: vendorProductsTable.advanceValue,

                rating: vendorProductsTable.rating,
                ratingCount: vendorProductsTable.ratingCount,

                businessName: vendorProductsTable.businessName,
                occupation: vendorProductsTable.occupation,

                images: vendorProductsTable.images,
                featuredImageIndex: vendorProductsTable.featuredImageIndex,
            })
            .from(vendorProductsTable)
            .innerJoin(
                vendorsTable,
                eq(vendorProductsTable.vendorId, vendorsTable.id)
            )
            .where(
                and(
                    eq(vendorProductsTable.isFeatured, true),
                    eq(vendorProductsTable.isActive, true),
                    eq(vendorsTable.isApproved, true)
                )
            )
            .limit(8);

        return NextResponse.json({
            products: rows.map((p) => ({
                ...p,
                basePriceSingleDay: Number(p.basePriceSingleDay),
                basePriceMultiDay: Number(p.basePriceMultiDay),
                advanceValue: Number(p.advanceValue ?? 0),
                rating: Number(p.rating),
            })),
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch featured products" },
            { status: 500 }
        );
    }
}
