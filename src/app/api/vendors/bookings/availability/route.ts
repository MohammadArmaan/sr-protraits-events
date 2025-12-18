import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorCalendarTable } from "@/config/vendorCalendarSchema";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { and, eq, gte, inArray } from "drizzle-orm";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const vendorProductId = Number(searchParams.get("vendorProductId"));

    if (!vendorProductId) {
        return NextResponse.json(
            { error: "vendorProductId is required" },
            { status: 400 }
        );
    }

    const today = format(new Date(), "yyyy-MM-dd");

    /* ---------- Resolve vendorId ---------- */
    const product = await db
        .select({ vendorId: vendorProductsTable.vendorId })
        .from(vendorProductsTable)
        .where(eq(vendorProductsTable.id, vendorProductId))
        .limit(1);

    if (!product.length) {
        return NextResponse.json(
            { error: "Vendor product not found" },
            { status: 404 }
        );
    }

    const vendorId = product[0].vendorId;

    /* ---------- Active bookings ---------- */
    const bookings = await db
        .select({
            startDate: vendorBookingsTable.startDate,
            endDate: vendorBookingsTable.endDate,
        })
        .from(vendorBookingsTable)
        .where(
            and(
                eq(vendorBookingsTable.vendorProductId, vendorProductId),
                inArray(vendorBookingsTable.status, [
                    "REQUESTED",
                    "PAYMENT_PENDING",
                    "CONFIRMED",
                ]),
                gte(vendorBookingsTable.endDate, today)
            )
        );

    /* ---------- Vendor calendar blocks ---------- */
    const blocks = await db
        .select({
            startDate: vendorCalendarTable.startDate,
            endDate: vendorCalendarTable.endDate,
        })
        .from(vendorCalendarTable)
        .where(eq(vendorCalendarTable.vendorId, vendorId));

    /* ---------- Unified unavailable ranges ---------- */
    const unavailableRanges = [
        ...bookings.map((b) => ({
            startDate: b.startDate,
            endDate: b.endDate,
            source: "BOOKING" as const,
        })),
        ...blocks.map((b) => ({
            startDate: b.startDate,
            endDate: b.endDate,
            source: "VENDOR_BLOCK" as const,
        })),
    ];

    return NextResponse.json({ unavailableRanges });
}
