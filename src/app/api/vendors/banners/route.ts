/**
 * Public – Get All Banners
 */
import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorBannersTable } from "@/config/vendorBannersSchema";
import { asc } from "drizzle-orm";

export async function GET() {
    try {
        const banners = await db
            .select({
                id: vendorBannersTable.id,
                imageUrl: vendorBannersTable.imageUrl,
                title: vendorBannersTable.title,
                subtitle: vendorBannersTable.subtitle,
                ctaText: vendorBannersTable.ctaText,
                ctaLink: vendorBannersTable.ctaLink,
                order: vendorBannersTable.order,
            })
            .from(vendorBannersTable)
            .orderBy(asc(vendorBannersTable.order));

        return NextResponse.json(
            { banners },
            {
                status: 200,
                headers: {
                    // Safe caching for CDN / edge
                    "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
                },
            }
        );
    } catch (error) {
        console.error("Get Banners Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch banners" },
            { status: 500 }
        );
    }
}
