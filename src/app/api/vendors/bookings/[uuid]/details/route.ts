// src/app/api/vendors/bookings/[uuid]/details/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";

import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorPaymentsTable } from "@/config/vendorPaymentsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { getVendorFromRequest } from "@/lib/vendor/getVendorFromRequest";

export async function GET(
    req: NextRequest,
    { params }: { params: { uuid: string } }
) {
    try {
        const { uuid } = await params;

        const vendor = await getVendorFromRequest(req);
        if (!vendor) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [booking] = await db
            .select()
            .from(vendorBookingsTable)
            .where(eq(vendorBookingsTable.uuid, uuid));

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        if (
            booking.vendorId !== vendor.id &&
            booking.bookedByVendorId !== vendor.id
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const [[requester], [provider], [product], payment] =
            await Promise.all([
                db
                    .select({
                        businessName: vendorsTable.businessName,
                        email: vendorsTable.email,
                        phone: vendorsTable.phone,
                        address: vendorsTable.address,
                    })
                    .from(vendorsTable)
                    .where(eq(vendorsTable.id, booking.bookedByVendorId)),

                db
                    .select({
                        businessName: vendorsTable.businessName,
                        email: vendorsTable.email,
                        phone: vendorsTable.phone,
                        address: vendorsTable.address,
                    })
                    .from(vendorsTable)
                    .where(eq(vendorsTable.id, booking.vendorId)),

                db
                    .select({ title: vendorProductsTable.title })
                    .from(vendorProductsTable)
                    .where(eq(vendorProductsTable.id, booking.vendorProductId)),

                booking.paymentId
                    ? db
                          .select()
                          .from(vendorPaymentsTable)
                          .where(eq(vendorPaymentsTable.id, booking.paymentId))
                          .then((r) =>
                              r[0]?.status === "PAID" ? r[0] : null
                          )
                    : Promise.resolve(null),
            ]);

        const advanceAmount = payment ? Number(payment.amount) / 100 : 0;
        const totalAmount = Number(booking.finalAmount);
        // const remainingAmount = Math.max(totalAmount - advanceAmount, 0);
        const remainingAmount = Number(booking.remainingAmount)

        return NextResponse.json({
            booking: {
                uuid: booking.uuid,
                bookingType: booking.bookingType,
                status: booking.status,
                startDate: booking.startDate,
                endDate: booking.endDate,
                totalDays: booking.totalDays,
                notes: booking.notes,
            },
            product,
            requester,
            provider,
            payment: {
                totalAmount,
                advanceAmount,
                remainingAmount,
                status: payment?.status ?? "NOT_PAID",
            },
        });
    } catch (err) {
        console.error("Booking details error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

