// src/app/api/vendors/bookings/[uuid]/pay/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorPaymentsTable } from "@/config/vendorPaymentsSchema";
import { eq } from "drizzle-orm";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(
    req: NextRequest,
    { params }: { params: { uuid: string } }
) {
    try {
        const { uuid } = await params;
        /* -------- AUTH (REQUESTING VENDOR) -------- */
        const token = req.cookies.get("vendor_token")?.value;
        if (!token)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            vendorId: number;
        };

        /* -------- FETCH BOOKING -------- */
        const [booking] = await db
            .select()
            .from(vendorBookingsTable)
            .where(eq(vendorBookingsTable.uuid, uuid));

        if (!booking)
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );

        if (booking.status !== "PAYMENT_PENDING")
            return NextResponse.json(
                { error: "Payment not allowed" },
                { status: 400 }
            );

        /* -------- CREATE RAZORPAY ORDER -------- */
        const order = await razorpay.orders.create({
            amount: Math.round(Number(booking.finalAmount) * 100), // paise
            currency: "INR",
            receipt: booking.uuid,
        });

        /* -------- STORE PAYMENT -------- */
        const razorpayAmount =
            typeof order.amount === "string"
                ? parseInt(order.amount, 10)
                : order.amount;

        if (!Number.isInteger(razorpayAmount)) {
            return NextResponse.json(
                { error: "Invalid payment amount" },
                { status: 500 }
            );
        }

        const [payment] = await db
            .insert(vendorPaymentsTable)
            .values({
                vendorId: booking.vendorId, // number
                vendorProductId: booking.vendorProductId, //  number
                razorpayOrderId: order.id, // string
                amount: razorpayAmount, // number (paise)
                currency: "INR",
                status: "CREATED",
            })
            .returning();

        /* -------- LINK PAYMENT TO BOOKING -------- */
        await db
            .update(vendorBookingsTable)
            .set({ paymentId: payment.id })
            .where(eq(vendorBookingsTable.id, booking.id));

        return NextResponse.json({
            key: process.env.RAZORPAY_KEY_ID,
            orderId: order.id,
            amount: order.amount,
            currency: "INR",
        });
    } catch (err) {
        console.error("Payment order error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
