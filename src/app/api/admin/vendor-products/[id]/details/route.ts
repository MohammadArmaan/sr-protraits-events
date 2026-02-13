import { db } from "@/config/db";
import { vendorCatalogsTable } from "@/config/vendorCatalogSchema";
import { vendorProductImagesTable } from "@/config/vendorProductImageSchema";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/vendor-products/[id]/details
export async function GET(
    req: NextRequest,
    context: { params: { id: string } },
) {
    await requireAdmin(req);

    const { id } = await context.params;
    const productId = Number(id);
    if (!Number.isInteger(productId)) {
        return NextResponse.json(
            { error: "Invalid product id" },
            { status: 400 },
        );
    }

    const [product] = await db
        .select()
        .from(vendorProductsTable)
        .where(eq(vendorProductsTable.id, productId))
        .limit(1);

    if (!product) {
        return NextResponse.json(
            { error: "Product not found" },
            { status: 404 },
        );
    }

    /* ---------------- FETCH PRODUCT IMAGES ---------------- */
    const images = await db
        .select({
            id: vendorProductImagesTable.id,
            catalogId: vendorProductImagesTable.catalogId,
            imageUrl: vendorProductImagesTable.imageUrl,
            isFeatured: vendorProductImagesTable.isFeatured,
            sortOrder: vendorProductImagesTable.sortOrder,
            catalogTitle: vendorCatalogsTable.title,
        })
        .from(vendorProductImagesTable)
        .leftJoin(
            vendorCatalogsTable,
            eq(vendorCatalogsTable.id, vendorProductImagesTable.catalogId),
        )
        .where(eq(vendorProductImagesTable.productId, productId));

    /* ---------------- GROUP BY CATALOG ---------------- */
    const imagesByCatalog: Record<number, any> = {};

    for (const img of images) {
        if (!imagesByCatalog[img.catalogId]) {
            imagesByCatalog[img.catalogId] = {
                catalogTitle: img.catalogTitle,
                images: [],
                featuredImageId: null,
            };
        }

        imagesByCatalog[img.catalogId].images.push({
            id: img.id,
            imageUrl: img.imageUrl,
            isFeatured: img.isFeatured,
            sortOrder: img.sortOrder,
        });

        if (img.isFeatured) {
            imagesByCatalog[img.catalogId].featuredImageId = img.id;
        }
    }

    return NextResponse.json({
        success: true,
        product,
        imagesByCatalog,
        catalogIds: Object.keys(imagesByCatalog).map(Number),
    });
}
