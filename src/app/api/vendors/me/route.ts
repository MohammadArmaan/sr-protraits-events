import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorCatalogsTable } from "@/config/vendorCatalogSchema";
import { vendorCatalogImagesTable } from "@/config/vendorCatalogImagesSchema";
import { eq, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("vendor_token")?.value;
        if (!token) return NextResponse.json(null, { status: 200 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            vendorId: number;
        };

        // -----------------------
        // Fetch vendor
        // -----------------------
        const [vendor] = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, decoded.vendorId));

        if (!vendor) return NextResponse.json(null, { status: 200 });

        // -----------------------
        // Fetch catalogs
        // -----------------------
        const catalogs = await db
            .select()
            .from(vendorCatalogsTable)
            .where(eq(vendorCatalogsTable.vendorId, vendor.id));

        // -----------------------
        // Fetch catalog images
        // -----------------------
        const catalogIds = catalogs.map((c) => c.id);

        const images =
    catalogIds.length > 0
        ? await db
              .select()
              .from(vendorCatalogImagesTable)
              .where(
                  inArray(
                      vendorCatalogImagesTable.catalogId,
                      catalogIds
                  )
              )
        : [];

        // -----------------------
        // Merge catalogs + images
        // -----------------------
        const catalogsWithImages = catalogs.map((catalog) => ({
            ...catalog,
            images: images.filter((img) => img.catalogId === catalog.id),
        }));

        return NextResponse.json(
            {
                vendor,
                catalogs: catalogsWithImages,
            },
            { status: 200 },
        );
    } catch (err) {
        console.error("Get vendor error:", err);
        return NextResponse.json(null, { status: 200 });
    }
}
