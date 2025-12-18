// src/app/api/vendors/calendar/block/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorCalendarTable } from "@/config/vendorCalendarSchema";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { and, eq, lte, gte, inArray } from "drizzle-orm";
import { differenceInCalendarDays } from "date-fns";
import { getVendorFromRequest } from "@/lib/vendor/getVendorFromRequest";

export async function POST(req: NextRequest) {
    try {
        const vendor = await getVendorFromRequest(req);

        if (!vendor) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { startDate, endDate, reason } = await req.json();

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: "startDate and endDate are required" },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return NextResponse.json(
                { error: "startDate cannot be after endDate" },
                { status: 400 }
            );
        }

        const days = differenceInCalendarDays(end, start) + 1;

        if (days > 10) {
            return NextResponse.json(
                { error: "You can block a maximum of 10 continuous days" },
                { status: 400 }
            );
        }

        /* -------- Prevent overlap with ACTIVE bookings -------- */
        const conflictingBooking = await db
            .select({ id: vendorBookingsTable.id })
            .from(vendorBookingsTable)
            .where(
                and(
                    eq(vendorBookingsTable.vendorId, vendor.id),
                    inArray(vendorBookingsTable.status, [
                        "REQUESTED",
                        "APPROVED",
                        "PAYMENT_PENDING",
                        "CONFIRMED",
                    ]),
                    lte(vendorBookingsTable.startDate, endDate),
                    gte(vendorBookingsTable.endDate, startDate)
                )
            )
            .limit(1);

        if (conflictingBooking.length > 0) {
            return NextResponse.json(
                { error: "Blocked dates overlap with an existing booking" },
                { status: 400 }
            );
        }

        /* -------- Prevent overlap with existing blocks -------- */
        const conflictingBlock = await db
            .select({ id: vendorCalendarTable.id })
            .from(vendorCalendarTable)
            .where(
                and(
                    eq(vendorCalendarTable.vendorId, vendor.id),
                    lte(vendorCalendarTable.startDate, endDate),
                    gte(vendorCalendarTable.endDate, startDate)
                )
            )
            .limit(1);

        if (conflictingBlock.length > 0) {
            return NextResponse.json(
                { error: "Dates already blocked" },
                { status: 400 }
            );
        }

        await db.insert(vendorCalendarTable).values({
            vendorId: vendor.id,
            startDate,
            endDate,
            reason,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Internal Server Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
