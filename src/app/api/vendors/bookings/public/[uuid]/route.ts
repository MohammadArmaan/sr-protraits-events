import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    { params }: { params: { uuid: string } }
) {
    const { uuid } = await params;

    const [booking] = await db
        .select({
            uuid: vendorBookingsTable.uuid,
            status: vendorBookingsTable.status,
            bookingType: vendorBookingsTable.bookingType,
            startDate: vendorBookingsTable.startDate,
            endDate: vendorBookingsTable.endDate,
            startTime: vendorBookingsTable.startTime,
            endTime: vendorBookingsTable.endTime,
            totalDays: vendorBookingsTable.totalDays,
            finalAmount: vendorBookingsTable.finalAmount,

            product: {
                title: vendorProductsTable.title,
            },

            vendor: {
                businessName: vendorsTable.businessName,
                email: vendorsTable.email,
            },
        })
        .from(vendorBookingsTable)
        .leftJoin(
            vendorProductsTable,
            eq(vendorBookingsTable.vendorProductId, vendorProductsTable.id)
        )
        .leftJoin(
            vendorsTable,
            eq(vendorBookingsTable.vendorId, vendorsTable.id)
        )
        .where(eq(vendorBookingsTable.uuid, uuid));

    if (!booking) {
        return NextResponse.json(
            { error: "Booking not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({ booking });
}
