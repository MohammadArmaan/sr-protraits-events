// src/app/api/vendors/products/[uuid]/review-booking/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorReviewsTable } from "@/config/vendorReviewsSchema";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { eq, and, isNull, desc } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ uuid: string }> }
) {
    try {
        const {uuid} = await context.params;
        /* -----------------------------
           Auth
        ----------------------------- */
        const token = req.cookies.get("vendor_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Missing token" },
                { status: 401 }
            );
        }

        let decoded: { vendorId: number };
        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET!
            ) as { vendorId: number };
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const vendorId = decoded.vendorId;

        /* -----------------------------
           Resolve product
        ----------------------------- */
        const [product] = await db
            .select()
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.uuid, uuid))
            .limit(1);

        if (!product) {
            return NextResponse.json(
                { error: "Invalid product" },
                { status: 404 }
            );
        }

        /* -----------------------------
           Find eligible booking
        ----------------------------- */
        const [booking] = await db
            .select({
                id: vendorBookingsTable.id,
            })
            .from(vendorBookingsTable)
            .leftJoin(
                vendorReviewsTable,
                eq(
                    vendorReviewsTable.bookingId,
                    vendorBookingsTable.id
                )
            )
            .where(
                and(
                    eq(
                        vendorBookingsTable.vendorProductId,
                        product.id
                    ),
                    eq(
                        vendorBookingsTable.bookedByVendorId,
                        vendorId
                    ),
                    eq(
                        vendorBookingsTable.status,
                        "COMPLETED"
                    ),
                    isNull(vendorReviewsTable.id)
                )
            )
            .orderBy(desc(vendorBookingsTable.endDate))
            .limit(1);

        return NextResponse.json({
            bookingId: booking?.id ?? null,
        });
    } catch (error) {
        console.error("Fetch review booking error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
