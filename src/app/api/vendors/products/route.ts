import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorCatalogImagesTable } from "@/config/vendorCatalogImagesSchema";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { PAGE_LIMIT } from "@/lib/constants";
import { vendorCatalogsTable } from "@/config/vendorCatalogSchema";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        /* ------------------ PAGINATION ------------------ */
        const page = Number(searchParams.get("page") ?? 1);
        const limit = Number(searchParams.get("limit") ?? PAGE_LIMIT);
        const offset = (page - 1) * limit;

        /* ------------------ FILTERS ------------------ */
        const q = searchParams.get("q")?.trim();
        const categoryId = searchParams.get("categoryId");
        const subCategoryId = searchParams.get("subCategoryId");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");

        /* ------------------ CONDITIONS ------------------ */
        const conditions = [
            eq(vendorProductsTable.isActive, true),
            eq(vendorsTable.isApproved, true),
        ];

        if (q) {
            conditions.push(
                sql`(
          ${vendorProductsTable.title} ILIKE ${"%" + q + "%"}
          OR ${vendorProductsTable.description} ILIKE ${"%" + q + "%"}
          OR ${vendorProductsTable.businessName} ILIKE ${"%" + q + "%"}
        )`,
            );
        }

        if (subCategoryId) {
            conditions.push(
                sql`EXISTS (
      SELECT 1
      FROM vendor_catalogs vc
      WHERE vc."vendorId" = ${vendorProductsTable.vendorId}
      AND vc."subCategoryId" = ${Number(subCategoryId)}
    )`,
            );
        }

        if (categoryId && !subCategoryId) {
            conditions.push(
                sql`EXISTS (
      SELECT 1
      FROM vendor_catalogs vc
      JOIN sub_categories sc ON sc."id" = vc."subCategoryId"
      WHERE vc."vendorId" = ${vendorProductsTable.vendorId}
      AND sc."categoryId" = ${Number(categoryId)}
    )`,
            );
        }

        if (minPrice) {
            conditions.push(
                gte(vendorProductsTable.basePriceSingleDay, minPrice),
            );
        }

        if (maxPrice) {
            conditions.push(
                lte(vendorProductsTable.basePriceSingleDay, maxPrice),
            );
        }

        /* ------------------ QUERY ------------------ */

        const products = await db
            .select({
                id: vendorProductsTable.id,
                uuid: vendorProductsTable.uuid,
                vendorId: vendorProductsTable.vendorId,

                title: vendorProductsTable.title,
                description: vendorProductsTable.description,

                basePriceSingleDay: vendorProductsTable.basePriceSingleDay,
                basePriceMultiDay: vendorProductsTable.basePriceMultiDay,

                advanceType: vendorProductsTable.advanceType,
                advanceValue: vendorProductsTable.advanceValue,

                rating: vendorProductsTable.rating,
                ratingCount: vendorProductsTable.ratingCount,

                occupation: vendorProductsTable.occupation,

                featuredImageUrl: vendorProductsTable.featuredImageUrl,

                isSessionBased: vendorProductsTable.isSessionBased,
                maxSessionHours: vendorProductsTable.maxSessionHours,

                isPriority: vendorProductsTable.isPriority,
                vendorPoints: vendorsTable.points,

                subCategoryName: sql<string | null>`
            (
                SELECT sc."name"
                FROM vendor_catalogs vc
                JOIN sub_categories sc 
                  ON sc."id" = vc."subCategoryId"
                WHERE vc."vendorId" = ${vendorProductsTable.vendorId}
                LIMIT 1
            )
        `,
            })
            .from(vendorProductsTable)
            .innerJoin(
                vendorsTable,
                eq(vendorProductsTable.vendorId, vendorsTable.id),
            )
            .where(and(...conditions))
            .orderBy(
                desc(vendorProductsTable.isPriority),
                desc(vendorsTable.points),
                desc(vendorProductsTable.rating),
            )
            .limit(limit)
            .offset(offset);

        /* ------------------ IMAGE OVERRIDE LOGIC ------------------ */

        let finalProducts = products;

        // If subcategory search → override image using catalog
        if (subCategoryId) {
            const catalogs = await db
                .select({
                    vendorId: vendorCatalogsTable.vendorId,
                    imageUrl: vendorCatalogImagesTable.imageUrl,
                })
                .from(vendorCatalogsTable)
                .innerJoin(
                    vendorCatalogImagesTable,
                    eq(
                        vendorCatalogImagesTable.catalogId,
                        vendorCatalogsTable.id,
                    ),
                )
                .where(
                    and(
                        eq(
                            vendorCatalogsTable.subCategoryId,
                            Number(subCategoryId),
                        ),
                        eq(vendorCatalogImagesTable.sortOrder, 0),
                    ),
                );

            const catalogMap = new Map<number, string>();

            catalogs.forEach((c) => {
                if (!catalogMap.has(c.vendorId)) {
                    catalogMap.set(c.vendorId, c.imageUrl);
                }
            });

            finalProducts = products.map((p) => {
                const overrideImage = catalogMap.get(p.vendorId);

                if (overrideImage) {
                    return {
                        ...p,
                        featuredImageUrl: overrideImage,
                    };
                }

                return p;
            });
        }

        /* ------------------ COUNT ------------------ */

        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(vendorProductsTable)
            .innerJoin(
                vendorsTable,
                eq(vendorProductsTable.vendorId, vendorsTable.id),
            )
            .where(and(...conditions));

        const total = Number(count);
        const totalPages = Math.ceil(total / limit);

        /* ------------------ RESPONSE ------------------ */

        return NextResponse.json({
            products: finalProducts,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error("Shop Products Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
