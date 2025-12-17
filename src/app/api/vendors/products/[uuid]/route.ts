import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq, and } from "drizzle-orm";

interface Params {
  params: { uuid: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { uuid } = await params;

    const [row] = await db
      .select({
        id: vendorProductsTable.id,
        uuid: vendorProductsTable.uuid,
        vendorId: vendorProductsTable.vendorId,
        title: vendorProductsTable.title,
        description: vendorProductsTable.description,

        basePriceSingleDay: vendorProductsTable.basePriceSingleDay,
        basePriceMultiDay: vendorProductsTable.basePriceMultiDay,
        pricingUnit: vendorProductsTable.pricingUnit,

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
      .where(
        and(
          eq(vendorProductsTable.uuid, uuid),
          eq(vendorProductsTable.isActive, true),
          eq(vendorsTable.isApproved, true)
        )
      );

    if (!row) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product: {
        ...row,
        basePriceSingleDay: Number(row.basePriceSingleDay),
        basePriceMultiDay: Number(row.basePriceMultiDay),
        advanceValue: Number(row.advanceValue ?? 0),
        rating: Number(row.rating),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
