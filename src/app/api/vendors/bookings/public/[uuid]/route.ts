import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";
import { getVendorFromRequest } from "@/lib/vendor/getVendorFromRequest";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await context.params;

        const vendor = await getVendorFromRequest(req);
        if (!vendor) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

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

                provider: {
                    id: vendorsTable.id,
                    businessName: vendorsTable.businessName,
                    email: vendorsTable.email,
                },

                requesterId: vendorBookingsTable.bookedByVendorId,
            })
            .from(vendorBookingsTable)
            .innerJoin(
                vendorProductsTable,
                eq(vendorBookingsTable.vendorProductId, vendorProductsTable.id)
            )
            .innerJoin(
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

        /* ---------- AUTH CHECK ---------- */
        if (
            booking.provider.id !== vendor.id &&
            booking.requesterId !== vendor.id
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        /* ---------- FETCH REQUESTER ---------- */
        const [requester] = await db
            .select({
                businessName: vendorsTable.businessName,
                email: vendorsTable.email,
            })
            .from(vendorsTable)
            .where(eq(vendorsTable.id, booking.requesterId));

        return NextResponse.json({
            booking: {
                uuid: booking.uuid,
                status: booking.status,
                bookingType: booking.bookingType,
                startDate: booking.startDate,
                endDate: booking.endDate,
                startTime: booking.startTime,
                endTime: booking.endTime,
                totalDays: booking.totalDays,
                finalAmount: Number(booking.finalAmount),
            },
            product: booking.product,
            provider: booking.provider,
            requester,
        });
    } catch (err) {
        console.error("Booking decision details error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
