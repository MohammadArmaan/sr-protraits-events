// src/app/api/vendors/bookings/[uuid]/notes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { and, eq, inArray, or } from "drizzle-orm";
import { getVendorFromRequest } from "@/lib/vendor/getVendorFromRequest";

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function countWords(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

/* ---------------------------------- */
/* POST: Update Booking Notes */
/* ---------------------------------- */

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await context.params;

        /* ---------------- AUTH ---------------- */
        const vendor = await getVendorFromRequest(req);

        if (!vendor) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        /* ---------------- BODY ---------------- */
        const body: unknown = await req.json();

        if (
            typeof body !== "object" ||
            body === null ||
            !("notes" in body)
        ) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const notes = (body as { notes: unknown }).notes;

        if (typeof notes !== "string") {
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

        /* ---------------- FIND BOOKING ---------------- */

        const [booking] = await db
            .select({
                id: vendorBookingsTable.id,
                vendorId: vendorBookingsTable.vendorId,
                bookedByVendorId: vendorBookingsTable.bookedByVendorId,
                status: vendorBookingsTable.status,
            })
            .from(vendorBookingsTable)
            .where(
                and(
                    eq(vendorBookingsTable.uuid, uuid),

                    // Allow BOTH provider and requester to edit
                    or(
                        eq(vendorBookingsTable.vendorId, vendor.id),
                        eq(
                            vendorBookingsTable.bookedByVendorId,
                            vendor.id
                        )
                    ),

                    // Only editable in these states
                    inArray(vendorBookingsTable.status, [
                        "CONFIRMED",
                        "COMPLETED",
                        "SETTLED",
                    ])
                )
            )
            .limit(1);

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found or not editable" },
                { status: 404 }
            );
        }

        /* ---------------- UPDATE ---------------- */

        await db
            .update(vendorBookingsTable)
            .set({
                notes: notes.trim() || null, // store null if empty
                updatedAt: new Date(),
            })
            .where(eq(vendorBookingsTable.id, booking.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Save booking notes error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
