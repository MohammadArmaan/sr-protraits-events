// /api/admin/vendor-products
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorCatalogsTable } from "@/config/vendorCatalogSchema";
import { vendorCatalogImagesTable } from "@/config/vendorCatalogImagesSchema";
import { eq, desc, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";

interface AdminTokenPayload {
    adminId: number;
    role: "admin" | "superadmin";
}

export async function GET(req: NextRequest) {
    try {
        /* ------------------------------------------------------------------ */
        /*                        READ vendorId FROM URL                        */
        /* ------------------------------------------------------------------ */
        const { searchParams } = new URL(req.url);
        const vendorIdParam = searchParams.get("vendorId");
        const vendorId = Number(vendorIdParam);

        if (!vendorIdParam || Number.isNaN(vendorId) || vendorId <= 0) {
            return NextResponse.json(
                { error: "Invalid vendorId" },
                { status: 400 },
            );
        }

        /* ------------------------------------------------------------------ */
        /*                                AUTH                                 */
        /* ------------------------------------------------------------------ */
        const token = req.cookies.get("admin_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!,
        ) as AdminTokenPayload;

        if (!["admin", "superadmin"].includes(decoded.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        /* ------------------------------------------------------------------ */
        /*                         VALIDATE VENDOR                             */
        /* ------------------------------------------------------------------ */
        const [vendor] = await db
            .select({ id: vendorsTable.id })
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 },
            );
        }

        /* ------------------------------------------------------------------ */
        /*                        FETCH CATALOGS                               */
        /* ------------------------------------------------------------------ */
        const catalogs = await db
            .select({
                id: vendorCatalogsTable.id,
                vendorId: vendorCatalogsTable.vendorId,
                title: vendorCatalogsTable.title,
                description: vendorCatalogsTable.description,
                categoryId: vendorCatalogsTable.categoryId,
                subCategoryId: vendorCatalogsTable.subCategoryId,
                createdAt: vendorCatalogsTable.createdAt,
            })
            .from(vendorCatalogsTable)
            .where(eq(vendorCatalogsTable.vendorId, vendorId))
            .orderBy(desc(vendorCatalogsTable.createdAt));

        if (catalogs.length === 0) {
            return NextResponse.json(
                {
                    success: true,
                    catalogs: [],
                },
                { status: 200 },
            );
        }

        /* ------------------------------------------------------------------ */
        /*                        FETCH CATALOG IMAGES                         */
        /* ------------------------------------------------------------------ */
        const catalogIds = catalogs.map((c) => c.id);

        const images = await db
            .select({
                id: vendorCatalogImagesTable.id,
                catalogId: vendorCatalogImagesTable.catalogId,
                imageUrl: vendorCatalogImagesTable.imageUrl,
                sortOrder: vendorCatalogImagesTable.sortOrder,
            })
            .from(vendorCatalogImagesTable)
            .where(inArray(vendorCatalogImagesTable.catalogId, catalogIds));

        /* ------------------------------------------------------------------ */
        /*                     GROUP IMAGES BY CATALOG                         */
        /* ------------------------------------------------------------------ */
        interface CatalogImage {
            id: number;
            catalogId: number;
            imageUrl: string;
            sortOrder: number;
        }

        const imagesByCatalogId = new Map<number, CatalogImage[]>();

        images
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .forEach((img) => {
                const normalizedImage: CatalogImage = {
                    id: img.id,
                    catalogId: img.catalogId,
                    imageUrl: img.imageUrl,
                    sortOrder: img.sortOrder ?? 0, // 👈 normalize here
                };

                if (!imagesByCatalogId.has(img.catalogId)) {
                    imagesByCatalogId.set(img.catalogId, []);
                }

                imagesByCatalogId.get(img.catalogId)!.push(normalizedImage);
            });

        /* ------------------------------------------------------------------ */
        /*                          MERGE RESULT                               */
        /* ------------------------------------------------------------------ */
        const catalogsWithImages = catalogs.map((catalog) => ({
            ...catalog,
            images: imagesByCatalogId.get(catalog.id) ?? [],
        }));

        /* ------------------------------------------------------------------ */
        /*                              RESPONSE                               */
        /* ------------------------------------------------------------------ */
        return NextResponse.json(
            {
                success: true,
                catalogs: catalogsWithImages,
            },
            {
                status: 200,
                headers: {
                    "Cache-Control": "private, max-age=60",
                },
            },
        );
    } catch (error) {
        console.error("Admin Fetch Vendor Catalogs Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch vendor catalogs" },
            { status: 500 },
        );
    }
}
