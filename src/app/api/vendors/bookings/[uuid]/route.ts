import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

/* -------------------- ALIASES -------------------- */
const serviceVendor = alias(vendorsTable, "service_vendor");
const bookedByVendor = alias(vendorsTable, "booked_by_vendor");

export async function GET(
    _req: NextRequest,
    { params }: { params: { uuid: string } }
) {
    try {
        const { uuid } = await params;

        if (!uuid) {
            return NextResponse.json(
                { error: "Booking UUID is required" },
                { status: 400 }
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
                approvalExpiresAt: vendorBookingsTable.approvalExpiresAt,

                product: {
                    title: vendorProductsTable.title,
                },

                vendor: {
                    businessName: serviceVendor.businessName,
                    email: serviceVendor.email,
                },

                bookedBy: {
                    businessName: bookedByVendor.businessName,
                    email: bookedByVendor.email,
                },
            })
            .from(vendorBookingsTable)
            .leftJoin(
                vendorProductsTable,
                eq(vendorBookingsTable.vendorProductId, vendorProductsTable.id)
            )
            .leftJoin(
                serviceVendor,
                eq(vendorBookingsTable.vendorId, serviceVendor.id)
            )
            .leftJoin(
                bookedByVendor,
                eq(vendorBookingsTable.bookedByVendorId, bookedByVendor.id)
            )
            .where(eq(vendorBookingsTable.uuid, uuid));

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // ✅ Return booking directly — no remapping bugs
        return NextResponse.json({ booking });
    } catch (error) {
        console.error("GET BOOKING ERROR:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
