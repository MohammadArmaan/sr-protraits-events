import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { adminsTable } from "@/config/adminsSchema";
import { vendorCatalogsTable } from "@/config/vendorCatalogSchema";
import { vendorCatalogImagesTable } from "@/config/vendorCatalogImagesSchema";
import { eq, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        // -----------------------------
        // Validate Admin Token
        // -----------------------------
        const token = req.cookies.get("admin_token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: Admin token missing" },
                { status: 401 },
            );
        }

        let decoded: { adminId: number; role: string };

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                adminId: number;
                role: string;
            };
        } catch {
            return NextResponse.json(
                { error: "Invalid admin token" },
                { status: 401 },
            );
        }

        if (decoded.role !== "admin") {
            return NextResponse.json(
                { error: "Access denied. Admins only." },
                { status: 403 },
            );
        }

        // -----------------------------
        // Fetch Vendors Ready for Activation
        // -----------------------------
        const vendors = await db
            .select({
                vendorId: vendorsTable.id,
                fullName: vendorsTable.fullName,
                businessName: vendorsTable.businessName,
                email: vendorsTable.email,
                profilePhoto: vendorsTable.profilePhoto,
                status: vendorsTable.status,
                currentStep: vendorsTable.currentStep,
                createdAt: vendorsTable.createdAt,
                approvedAt: vendorsTable.approvedAt,
                approvedBy: adminsTable.fullName,
            })
            .from(vendorsTable)
            .leftJoin(
                adminsTable,
                eq(vendorsTable.approvedByAdminId, adminsTable.id),
            )
            .where(eq(vendorsTable.currentStep, 4)) // ✅ Catalog created
            .orderBy(vendorsTable.createdAt);

        // -----------------------------
        // Fetch catalogs + images per vendor
        // -----------------------------
        const vendorIds = vendors.map((v) => v.vendorId);

        const catalogs = vendorIds.length
            ? await db
                  .select({
                      catalogId: vendorCatalogsTable.id,
                      vendorId: vendorCatalogsTable.vendorId,
                      title: vendorCatalogsTable.title,
                      imageUrl: vendorCatalogImagesTable.imageUrl,
                  })
                  .from(vendorCatalogsTable)
                  .leftJoin(
                      vendorCatalogImagesTable,
                      eq(
                          vendorCatalogsTable.id,
                          vendorCatalogImagesTable.catalogId,
                      ),
                  )
                  .where(inArray(vendorCatalogsTable.vendorId, vendorIds))
            : [];

        // -----------------------------
        // Group catalogs by vendor
        // -----------------------------
        const catalogMap = new Map<number, any[]>();

        catalogs.forEach((c) => {
            if (!catalogMap.has(c.vendorId)) {
                catalogMap.set(c.vendorId, []);
            }

            catalogMap.get(c.vendorId)!.push({
                catalogId: c.catalogId,
                title: c.title,
                imageUrl: c.imageUrl,
            });
        });

        // -----------------------------
        // Final response
        // -----------------------------
        const response = vendors.map((v) => ({
            ...v,
            catalogs: catalogMap.get(v.vendorId) ?? [],
        }));

        return NextResponse.json(
            { success: true, vendors: response },
            { status: 200 },
        );
    } catch (error) {
        console.error("Activation list fetch error:", error);
        return NextResponse.json(
            { error: "Server error fetching activation list" },
            { status: 500 },
        );
    }
}
