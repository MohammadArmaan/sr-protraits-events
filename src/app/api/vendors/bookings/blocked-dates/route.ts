// src/app/api/vendors/bookings/blocked-dates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const vendorId = Number(searchParams.get("vendorId"));

        if (!vendorId || Number.isNaN(vendorId)) {
            return NextResponse.json(
                { error: "vendorId is required" },
                { status: 400 }
            );
        }

        /* -------- Fetch CONFIRMED bookings -------- */
        const bookings = await db
            .select({
                bookingType: vendorBookingsTable.bookingType,
                startDate: vendorBookingsTable.startDate,
                endDate: vendorBookingsTable.endDate,
                startTime: vendorBookingsTable.startTime,
                endTime: vendorBookingsTable.endTime,
            })
            .from(vendorBookingsTable)
            .where(
                and(
                    eq(vendorBookingsTable.vendorId, vendorId),
                    eq(vendorBookingsTable.status, "CONFIRMED")
                )
            )
            .orderBy(vendorBookingsTable.startDate);

        return NextResponse.json({
            blocked: bookings,
        });
    } catch (error) {
        console.error("Blocked dates fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
