// src/app/api/vendors/calendar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorCalendarTable } from "@/config/vendorCalendarSchema";
import { and, eq, inArray } from "drizzle-orm";
import { getVendorFromRequest } from "@/lib/vendor/getVendorFromRequest";

export async function GET(req: NextRequest) {
    try {
        const vendor = await getVendorFromRequest(req);

        if (!vendor) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const vendorId = vendor.id;

        const bookedForMe = await db
            .select()
            .from(vendorBookingsTable)
            .where(
                and(
                    eq(vendorBookingsTable.vendorId, vendorId),
                    inArray(vendorBookingsTable.status, [
                        "CONFIRMED",
                        "COMPLETED",
                    ])
                )
            );

        const bookedByMe = await db
            .select()
            .from(vendorBookingsTable)
            .where(
                and(
                    eq(vendorBookingsTable.bookedByVendorId, vendorId),
                    inArray(vendorBookingsTable.status, [
                        "CONFIRMED",
                        "COMPLETED",
                    ])
                )
            );

        const blockedDates = await db
            .select()
            .from(vendorCalendarTable)
            .where(eq(vendorCalendarTable.vendorId, vendorId));

        return NextResponse.json({
            bookedForMe,
            bookedByMe,
            blockedDates,
        });
    } catch (err) {
        console.error("Internal Server Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
