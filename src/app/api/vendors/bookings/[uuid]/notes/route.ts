// src/app/api/vendors/bookings/[uuid]/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { and, eq, inArray } from "drizzle-orm";
import { getVendorFromRequest } from "@/lib/vendor/getVendorFromRequest";

function countWords(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(
    req: NextRequest,
    { params }: { params: { uuid: string } }
) {
    try {
        const { uuid } = await params;
        const vendor = await getVendorFromRequest(req);

        if (!vendor) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { notes } = await req.json();

        // notes can be empty string, but must exist
        if (notes === undefined || typeof notes !== "string") {
            return NextResponse.json(
                { error: "Notes must be a string" },
                { status: 400 }
            );
        }

        if (notes && countWords(notes) > 50) {
            return NextResponse.json(
                { error: "Notes cannot exceed 50 words" },
                { status: 400 }
            );
        }

        const booking = await db
            .select({ id: vendorBookingsTable.id })
            .from(vendorBookingsTable)
            .where(
                and(
                    eq(vendorBookingsTable.uuid, uuid),
                    eq(vendorBookingsTable.vendorId, vendor.id),
                    inArray(vendorBookingsTable.status, [
                        "CONFIRMED",
                        "COMPLETED",
                    ])
                )
            )
            .limit(1);

        if (!booking.length) {
            return NextResponse.json(
                { error: "Booking not found or not editable" },
                { status: 404 }
            );
        }

        await db
            .update(vendorBookingsTable)
            .set({
                notes: notes.trim(), // "" allowed
                updatedAt: new Date(),
            })
            .where(eq(vendorBookingsTable.id, booking[0].id));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Save booking notes error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
