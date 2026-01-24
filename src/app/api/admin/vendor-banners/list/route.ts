/**
 * Admin – Get All Banners (No Cache)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorBannersTable } from "@/config/vendorBannersSchema";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        await requireAdmin(req);

        const banners = await db
            .select({
                id: vendorBannersTable.id,
                imageUrl: vendorBannersTable.imageUrl,
                title: vendorBannersTable.title,
                subtitle: vendorBannersTable.subtitle,
                ctaText: vendorBannersTable.ctaText,
                ctaLink: vendorBannersTable.ctaLink,
                order: vendorBannersTable.order,
                createdAt: vendorBannersTable.createdAt,
            })
            .from(vendorBannersTable)
            .orderBy(asc(vendorBannersTable.order));

        return NextResponse.json(
            { banners },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            },
        );
    } catch (error) {
        console.error("Admin Get Banners Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch banners" },
            { status: 500 },
        );
    }
}
