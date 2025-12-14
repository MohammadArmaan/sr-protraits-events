import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq, and } from "drizzle-orm";

interface Params {
    params: {
        uuid: string;
    };
}

export async function GET(
    _req: NextRequest,
    { params }: Params
) {
    try {
        const { uuid } = await params;

        const [product] = await db
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
                    eq(vendorProductsTable.uuid, uuid),
                    eq(vendorProductsTable.isActive, true),
                    eq(vendorsTable.isApproved, true)
                )
            );

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const businessPhotos = Array.isArray(product.images)
            ? product.images
            : [];

        return NextResponse.json({
            product: {
                id: product.id,
                uuid: product.uuid,
                title: product.title,
                description: product.description ?? null,

                basePrice: product.basePrice,
                advanceType: product.advanceType,
                advanceValue: product.advanceValue,

                rating: product.rating,
                ratingCount: product.ratingCount,

                businessName: product.businessName,
                occupation: product.occupation,

                // 🔁 MATCH OTHER APIS
                businessPhotos,
                featuredImageIndex:
                    typeof product.featuredImageIndex === "number"
                        ? product.featuredImageIndex
                        : 0,
            },
        });
    } catch (error) {
        console.error("Get Vendor Product Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
