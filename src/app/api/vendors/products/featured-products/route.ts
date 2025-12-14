import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq, and } from "drizzle-orm";

export async function GET() {
    try {
        const featuredProducts = await db
            .select({
                id: vendorProductsTable.id,
                uuid: vendorProductsTable.uuid,
                title: vendorProductsTable.title,
                description: vendorProductsTable.description,
                basePrice: vendorProductsTable.basePrice,
                advanceType: vendorProductsTable.advanceType,
                advanceValue: vendorProductsTable.advanceValue,
                rating: vendorProductsTable.rating,
                ratingCount: vendorProductsTable.ratingCount,
                featuredImageIndex: vendorProductsTable.featuredImageIndex,

                vendorId: vendorsTable.id,
                businessName: vendorsTable.businessName,
                occupation: vendorsTable.occupation,
                businessPhotos: vendorsTable.businessPhotos,
                profilePhoto: vendorsTable.profilePhoto,
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
            .orderBy(vendorProductsTable.createdAt)
            .limit(8); // 🔥 IMPORTANT: cap results

        return NextResponse.json(
            { products: featuredProducts },
            { status: 200 }
        );
    } catch (error) {
        console.error("Featured Products Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch featured products" },
            { status: 500 }
        );
    }
}
