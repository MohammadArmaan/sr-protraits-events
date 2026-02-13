import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorCalendarTable } from "@/config/vendorCalendarSchema";
import { and, eq, gte, lte } from "drizzle-orm";
import { getVendorFromRequest } from "@/lib/vendor/getVendorFromRequest";
import { generateCSVReport } from "@/lib/vendor/generateCSVReport";
import { generatePDFReport } from "@/lib/vendor/generatePDFReport";
import {
    mapBlockedToReport,
    mapBookingToReport,
} from "@/lib/vendor/reportMappers";

export async function GET(req: NextRequest) {
    try {
        const vendor = await getVendorFromRequest(req);
        if (!vendor) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const type = searchParams.get("type");

        if (!from || !to || !type) {
            return NextResponse.json(
                { error: "Invalid query params" },
                { status: 400 },
            );
        }

        const vendorId = vendor.id;

        // ===============================
        // BOOKINGS
        // ===============================

        const bookedForMeRaw = await db
            .select()
            .from(vendorBookingsTable)
            .where(
                and(
                    eq(vendorBookingsTable.vendorId, vendorId),
                    gte(vendorBookingsTable.startDate, from),
                    lte(vendorBookingsTable.endDate, to),
                ),
            );

        const bookedByMeRaw = await db
            .select()
            .from(vendorBookingsTable)
            .where(
                and(
                    eq(vendorBookingsTable.bookedByVendorId, vendorId),
                    gte(vendorBookingsTable.startDate, from),
                    lte(vendorBookingsTable.endDate, to),
                ),
            );

        const blockedRaw = await db
            .select()
            .from(vendorCalendarTable)
            .where(eq(vendorCalendarTable.vendorId, vendorId));

        const bookedForMe = bookedForMeRaw.map(mapBookingToReport);
        const bookedByMe = bookedByMeRaw.map(mapBookingToReport);
        const blockedDates = blockedRaw.map(mapBlockedToReport);

        if (type === "csv") {
            return generateCSVReport(bookedForMe, bookedByMe, blockedDates);
        }

        if (type === "pdf") {
            return await generatePDFReport(
                bookedForMe,
                bookedByMe,
                blockedDates,
                vendor.fullName,
            );
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
