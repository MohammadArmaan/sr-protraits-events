// src/app/api/vendors/bookings/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { and, eq, gte, inArray } from "drizzle-orm";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const vendorProductId = Number(searchParams.get("vendorProductId"));
    const requesterVendorId = Number(searchParams.get("requesterVendorId"));

    if (!vendorProductId || !requesterVendorId) {
        return NextResponse.json(
            { error: "vendorProductId and requesterVendorId are required" },
            { status: 400 }
        );
    }

    // PgDateString → must be YYYY-MM-DD
    const today = format(new Date(), "yyyy-MM-dd");

    const activeBooking = await db
        .select({
            endDate: vendorBookingsTable.endDate,
        })
        .from(vendorBookingsTable)
        .where(
            and(
                eq(vendorBookingsTable.vendorProductId, vendorProductId),
                eq(vendorBookingsTable.bookedByVendorId, requesterVendorId), // 🔑 KEY FIX
                inArray(vendorBookingsTable.status, [
                    "REQUESTED",
                    "PAYMENT_PENDING",
                    "CONFIRMED",
                ]),
                gte(vendorBookingsTable.endDate, today)
            )
        )
        .orderBy(vendorBookingsTable.endDate)
        .limit(1);

    if (!activeBooking.length) {
        return NextResponse.json({ hasActiveBooking: false });
    }

    return NextResponse.json({
        hasActiveBooking: true,
        nextAvailableDate: activeBooking[0].endDate,
    });
}
