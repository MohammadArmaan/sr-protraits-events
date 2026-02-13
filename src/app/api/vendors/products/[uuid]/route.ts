import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorProductImagesTable } from "@/config/vendorProductImageSchema";
import { vendorCatalogsTable } from "@/config/vendorCatalogSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await context.params;

    /* ---------------------------
       1️⃣ Fetch Product
    ---------------------------- */
    const [productRow] = await db
      .select()
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

    if (!productRow) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const product = productRow.vendor_products;

    /* ---------------------------
       2️⃣ Fetch Product Images
    ---------------------------- */
    const images = await db
      .select()
      .from(vendorProductImagesTable)
      .where(eq(vendorProductImagesTable.productId, product.id));

    /* ---------------------------
       3️⃣ Fetch Catalog Titles
    ---------------------------- */
    const catalogs = await db
      .select()
      .from(vendorCatalogsTable)
      .where(eq(vendorCatalogsTable.vendorId, product.vendorId));

    const catalogMap = new Map(
      catalogs.map((c) => [c.id, c.title])
    );

    /* ---------------------------
       4️⃣ Group Images By Catalog
    ---------------------------- */
    const imagesByCatalog: Record<
      number,
      {
        catalogTitle: string;
        featuredImageId: number | null;
        images: typeof images;
      }
    > = {};

    for (const img of images) {
      if (!imagesByCatalog[img.catalogId]) {
        imagesByCatalog[img.catalogId] = {
          catalogTitle: catalogMap.get(img.catalogId) ?? "Untitled",
          featuredImageId: null,
          images: [],
        };
      }

      imagesByCatalog[img.catalogId].images.push(img);

      if (img.isFeatured) {
        imagesByCatalog[img.catalogId].featuredImageId = img.id;
      }
    }

    /* ---------------------------
       5️⃣ Return Response
    ---------------------------- */
    return NextResponse.json({
      product: {
        ...product,
        basePriceSingleDay: Number(product.basePriceSingleDay),
        basePriceMultiDay: Number(product.basePriceMultiDay),
        advanceValue: Number(product.advanceValue ?? 0),
        rating: Number(product.rating),

        isSessionBased: product.isSessionBased,
        maxSessionHours: product.maxSessionHours,
      },
      imagesByCatalog,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
