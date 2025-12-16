import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { SQL } from "drizzle-orm";
import { PAGE_LIMIT } from "@/lib/constants";

type SortOption = SQL;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        /* ------------------ PAGINATION ------------------ */
        const page = Number(searchParams.get("page") ?? 1);
        const limit = Number(searchParams.get("limit") ?? PAGE_LIMIT);
        const offset = (page - 1) * limit;

        /* ------------------ FILTERS ------------------ */
        const q = searchParams.get("q")?.trim();
        const category = searchParams.get("category");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const sort = searchParams.get("sort") ?? "newest";

        /* ------------------ WHERE CONDITIONS ------------------ */
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
        )`
            );
        }

        if (category) {
            conditions.push(eq(vendorProductsTable.occupation, category));
        }

        if (minPrice) {
            conditions.push(gte(vendorProductsTable.basePriceSingleDay, minPrice));
        }

        if (maxPrice) {
            conditions.push(lte(vendorProductsTable.basePriceSingleDay, maxPrice));
        }

        /* ------------------ SORT ------------------ */
        const SORT_MAP: Record<string, SortOption> = {
            price_asc: asc(vendorProductsTable.basePriceSingleDay),
            price_desc: desc(vendorProductsTable.basePriceSingleDay),
            rating_desc: desc(vendorProductsTable.rating),
            newest: desc(vendorProductsTable.createdAt),
        };

        const orderBy = SORT_MAP[sort] ?? SORT_MAP.newest;

        /* ------------------ DATA QUERY ------------------ */
        const products = await db
            .select({
                id: vendorProductsTable.id,
                uuid: vendorProductsTable.uuid,
                title: vendorProductsTable.title,
                description: vendorProductsTable.description,
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
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        /* ------------------ COUNT QUERY ------------------ */
        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(vendorProductsTable)
            .innerJoin(
                vendorsTable,
                eq(vendorProductsTable.vendorId, vendorsTable.id)
            )
            .where(and(...conditions));

        const total = Number(count);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            products: products.map((p) => {
                const images = Array.isArray(p.images) ? p.images : [];

                return {
                    id: p.id,
                    uuid: p.uuid,
                    title: p.title,
                    description: p.description ?? null,

                    basePriceSingleDay: p.basePriceSingleDay,
                    basePriceMultiDay: p.basePriceMultiDay,
                    advanceType: p.advanceType,
                    advanceValue: p.advanceValue,

                    rating: p.rating,
                    ratingCount: p.ratingCount,

                    businessName: p.businessName,
                    occupation: p.occupation,

                    // 👇 MATCH FEATURED API
                    images,
                    featuredImageIndex:
                        typeof p.featuredImageIndex === "number"
                            ? p.featuredImageIndex
                            : 0,
                };
            }),
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
            { status: 500 }
        );
    }
}