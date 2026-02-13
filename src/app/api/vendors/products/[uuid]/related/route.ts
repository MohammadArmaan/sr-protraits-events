import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { and, desc, eq, ne } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await context.params;

    /* ------------------ 1️⃣ Fetch Current Product ------------------ */
    const [currentProduct] = await db
      .select({
        vendorId: vendorProductsTable.vendorId,
        occupation: vendorProductsTable.occupation,
      })
      .from(vendorProductsTable)
      .where(eq(vendorProductsTable.uuid, uuid))
      .limit(1);

    if (!currentProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    /* ------------------ 2️⃣ Fetch Related Products ------------------ */
    const relatedProducts = await db
      .select({
        id: vendorProductsTable.id,
        uuid: vendorProductsTable.uuid,
        title: vendorProductsTable.title,

        basePriceSingleDay: vendorProductsTable.basePriceSingleDay,
        basePriceMultiDay: vendorProductsTable.basePriceMultiDay,

        advanceType: vendorProductsTable.advanceType,
        advanceValue: vendorProductsTable.advanceValue,

        rating: vendorProductsTable.rating,
        ratingCount: vendorProductsTable.ratingCount,

        occupation: vendorProductsTable.occupation,

        featuredImageUrl: vendorProductsTable.featuredImageUrl,
        isSessionBased: vendorProductsTable.isSessionBased,
      })
      .from(vendorProductsTable)
      .innerJoin(
        vendorsTable,
        eq(vendorProductsTable.vendorId, vendorsTable.id)
      )
      .where(
        and(
          eq(vendorProductsTable.isActive, true),
          eq(vendorsTable.isApproved, true),
          eq(
            vendorProductsTable.occupation,
            currentProduct.occupation
          ),
          ne(vendorProductsTable.vendorId, currentProduct.vendorId)
        )
      )
      .orderBy(
        desc(vendorProductsTable.rating),
        desc(vendorProductsTable.createdAt)
      )
      .limit(6);

    return NextResponse.json({
      products: relatedProducts.map((p) => ({
        id: p.id,
        uuid: p.uuid,
        title: p.title,

        basePriceSingleDay: Number(p.basePriceSingleDay),
        basePriceMultiDay: Number(p.basePriceMultiDay),

        advanceType: p.advanceType,
        advanceValue: Number(p.advanceValue ?? 0),

        rating: Number(p.rating),
        ratingCount: p.ratingCount,

        businessName: p.businessName,
        occupation: p.occupation,

        featuredImageUrl: p.featuredImageUrl,
        isSessionBased: p.isSessionBased,
      })),
    });
  } catch (error) {
    console.error("Related Products Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
