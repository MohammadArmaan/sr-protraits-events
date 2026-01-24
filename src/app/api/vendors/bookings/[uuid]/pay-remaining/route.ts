import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorPaymentsTable } from "@/config/vendorPaymentsSchema";
import { and, eq } from "drizzle-orm";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await context.params;

        /* -------- AUTH -------- */
        const token = req.cookies.get("vendor_token")?.value;
        if (!token)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );

        jwt.verify(token, process.env.JWT_SECRET!);

        /* -------- FETCH BOOKING -------- */
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

        /* -------- EVENT DATE CHECK (KEY FIX) -------- */
        const now = new Date();
        const eventEndDate = new Date(booking.endDate);

        if (eventEndDate > now) {
            return NextResponse.json(
                { error: "Event not completed yet" },
                { status: 400 }
            );
        }

        /* -------- FETCH ADVANCE PAYMENT (ROBUST) -------- */
        const [advancePayment] = await db
            .select()
            .from(vendorPaymentsTable)
            .where(
                and(
                    eq(
                        vendorPaymentsTable.vendorProductId,
                        booking.vendorProductId
                    ),
                    eq(vendorPaymentsTable.status, "PAID")
                )
            );

        if (!advancePayment) {
            return NextResponse.json(
                { error: "Advance payment not completed" },
                { status: 400 }
            );
        }

        const finalAmount = Number(booking.finalAmount);
        const advanceAmount = advancePayment.amount / 100;
        const remainingAmount = Math.max(finalAmount - advanceAmount, 0);

        if (remainingAmount <= 0) {
            return NextResponse.json(
                { error: "No remaining amount to pay" },
                { status: 400 }
            );
        }

        const remainingInPaise = Math.round(remainingAmount * 100);

        /* -------- CREATE RAZORPAY ORDER -------- */
        const order = await razorpay.orders.create({
            amount: remainingInPaise,
            currency: "INR",
            receipt: `rem_${booking.id}`, // ✅ FIXED (≤ 40 chars)
        });

        /* -------- STORE PAYMENT -------- */
        await db.insert(vendorPaymentsTable).values({
            vendorId: booking.vendorId,
            vendorProductId: booking.vendorProductId,
            razorpayOrderId: order.id,
            amount: remainingInPaise,
            currency: "INR",
            status: "CREATED",
        });

        return NextResponse.json({
            key: process.env.RAZORPAY_KEY_ID,
            orderId: order.id,
            amount: remainingInPaise,
            currency: "INR",
        });
    } catch (err) {
        console.error("Remaining payment error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
