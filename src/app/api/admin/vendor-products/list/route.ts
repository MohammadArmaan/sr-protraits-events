/**
 * Admin – Get All Vendor Products (Marketplace)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        /* ---------------- AUTH ---------------- */
        await requireAdmin(req);

        /* ---------------- FETCH PRODUCTS ---------------- */
        const products = await db
            .select({
                id: vendorProductsTable.id,
                uuid: vendorProductsTable.uuid,

                vendorId: vendorProductsTable.vendorId,
                businessName: vendorProductsTable.businessName,
                occupation: vendorProductsTable.occupation,

                title: vendorProductsTable.title,
                description: vendorProductsTable.description,

                images: vendorProductsTable.images,
                featuredImageIndex: vendorProductsTable.featuredImageIndex,

                basePriceSingleDay: vendorProductsTable.basePriceSingleDay,
                basePriceMultiDay: vendorProductsTable.basePriceMultiDay,
                pricingUnit: vendorProductsTable.pricingUnit,

                advanceType: vendorProductsTable.advanceType,
                advanceValue: vendorProductsTable.advanceValue,

                isFeatured: vendorProductsTable.isFeatured,
                isActive: vendorProductsTable.isActive,

                createdAt: vendorProductsTable.createdAt,
            })
            .from(vendorProductsTable)
            .orderBy(desc(vendorProductsTable.createdAt));

        return NextResponse.json(
            {
                success: true,
                products,
            },
            {
                status: 200,
                headers: {
                    "Cache-Control": "no-store",
                },
            },
        );
    } catch (error) {
        console.error("Admin Get Vendor Products Error:", error);

        if (error instanceof Error) {
            if (error.message === "UNAUTHORIZED") {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }
            if (error.message === "FORBIDDEN") {
                return NextResponse.json(
                    { error: "Forbidden" },
                    { status: 403 },
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to fetch vendor products" },
            { status: 500 },
        );
    }
}
