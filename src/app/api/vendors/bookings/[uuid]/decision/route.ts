// src/app/api/vendors/bookings/[uuid]/decision/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";

import { sendEmail } from "@/lib/sendEmail";
import { bookingApprovedVendorTemplate } from "@/lib/email-templates/bookingApprovedVendorTemplate";
import { bookingRejectedVendorTemplate } from "@/lib/email-templates/bookingRejectedVendorTemplate";
import { vendorBankDetailsTable } from "@/config/vendorBankDetailsSchema";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await context.params;
        /* ---------- AUTH (SERVICE PROVIDER) ---------- */
        const token = req.cookies.get("vendor_token")?.value;
        if (!token)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            vendorId: number;
        };

        /* ---------- CHECK PAYOUT READY ---------- */
        const bankDetails = await db
            .select({ id: vendorBankDetailsTable.id })
            .from(vendorBankDetailsTable)
            .where(eq(vendorBankDetailsTable.vendorId, decoded.vendorId))
            .limit(1);

        if (!bankDetails.length) {
            return NextResponse.json(
                {
                    error: "Complete payout details before approving bookings.",
                },
                { status: 400 }
            );
        }

        const { decision }: { decision: "APPROVE" | "REJECT" } =
            await req.json();

        if (!["APPROVE", "REJECT"].includes(decision)) {
            return NextResponse.json(
                { error: "Invalid decision" },
                { status: 400 }
            );
        }

        /* ---------- FETCH BOOKING ---------- */
        const [booking] = await db
            .select()
            .from(vendorBookingsTable)
            .where(eq(vendorBookingsTable.uuid, uuid));

        if (!booking)
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );

        if (booking.vendorId !== decoded.vendorId)
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        /* ---------- EXPIRY CHECK ---------- */
        if (new Date() > booking.approvalExpiresAt) {
            await db
                .update(vendorBookingsTable)
                .set({ status: "EXPIRED" })
                .where(eq(vendorBookingsTable.id, booking.id));

            return NextResponse.json(
                { error: "Booking request expired" },
                { status: 410 }
            );
        }
        /* ---------- CHECK VALID ADVANCE AMMOUNT ---------- */

        if (Number(booking.advanceAmount) <= 0) {
            return NextResponse.json(
                { error: "Invalid advance amount" },
                { status: 400 }
            );
        }

        /* ---------- FETCH REQUESTING VENDOR ---------- */
        const [requester] = await db
            .select({
                businessName: vendorsTable.businessName,
                email: vendorsTable.email,
            })
            .from(vendorsTable)
            .where(eq(vendorsTable.id, booking.bookedByVendorId));

        if (!requester)
            return NextResponse.json(
                { error: "Requesting vendor not found" },
                { status: 404 }
            );

        /* ---------- FETCH PRODUCT ---------- */
        const [product] = await db
            .select({
                title: vendorProductsTable.title,
                advanceType: vendorProductsTable.advanceType,
                advanceValue: vendorProductsTable.advanceValue,
            })
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.id, booking.vendorProductId));

        if (!product)
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );

        /* ---------- EMAIL ---------- */
        if (decision === "APPROVE") {
            // ---------------- ADVANCE CALCULATION ----------------
            let advanceAmount = Number(booking.finalAmount);

            if (product.advanceType && product.advanceValue) {
                if (product.advanceType === "PERCENTAGE") {
                    advanceAmount = Math.round(
                        (Number(booking.finalAmount) *
                            Number(product.advanceValue)) /
                            100
                    );
                }

                if (product.advanceType === "FIXED") {
                    advanceAmount = Number(product.advanceValue);
                }

                // Safety clamp
                advanceAmount = Math.min(
                    advanceAmount,
                    Number(booking.finalAmount)
                );
            }

            await sendEmail({
                to: requester.email,
                subject: "Booking Approved – Pay Advance 💳",
                html: bookingApprovedVendorTemplate(
                    requester.businessName,
                    product.title,
                    booking.uuid,
                    advanceAmount, // ✅ advance
                    Number(booking.finalAmount), // ✅ total
                    booking.totalDays > 1 ? booking.totalDays : undefined // ✅ days only if multi-day
                ),
            });
        }

        if (decision === "REJECT") {
            await sendEmail({
                to: requester.email,
                subject: "Booking Request Rejected",
                html: bookingRejectedVendorTemplate(
                    requester.businessName,
                    product.title
                ),
            });
        }

        /* ---------- UPDATE STATUS ---------- */
        const nextStatus =
            decision === "APPROVE" ? "PAYMENT_PENDING" : "REJECTED";

        await db
            .update(vendorBookingsTable)
            .set({
                status: nextStatus,
                updatedAt: new Date(),
            })
            .where(eq(vendorBookingsTable.id, booking.id));

        return NextResponse.json({ success: true, status: nextStatus });
    } catch (err) {
        console.error("Decision error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
