// src/app/api/vendors/bookings/[uuid]/pay/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import { db } from "@/config/db";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorPaymentsTable } from "@/config/vendorPaymentsSchema";
import { eq } from "drizzle-orm";
import { vendorProductsTable } from "@/config/vendorProductsSchema";

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

        /* -------- AUTH -------- */
        const token = req.cookies.get("vendor_token")?.value;
        if (!token)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        jwt.verify(token, process.env.JWT_SECRET!);

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

        /* -------- FETCH PRODUCT (for advance config) -------- */
        const [product] = await db
            .select({
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

        /* -------- CALCULATE ADVANCE -------- */
        let advanceAmount = Number(booking.finalAmount);

        if (product.advanceType && product.advanceValue) {
            if (product.advanceType === "PERCENTAGE") {
                advanceAmount = Math.round(
                    (Number(booking.finalAmount) * Number(product.advanceValue)) / 100
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

        const advanceInPaise = Math.round(advanceAmount * 100);

        /* -------- CREATE RAZORPAY ORDER -------- */
        const order = await razorpay.orders.create({
            amount: advanceInPaise,
            currency: "INR",
            receipt: booking.uuid,
        });

        /* -------- STORE PAYMENT -------- */
        const [payment] = await db
            .insert(vendorPaymentsTable)
            .values({
                vendorId: booking.vendorId,
                vendorProductId: booking.vendorProductId,
                razorpayOrderId: order.id,
                amount: advanceInPaise, // ✅ ADVANCE ONLY
                currency: "INR",
                status: "CREATED",
            })
            .returning();

        /* -------- LINK PAYMENT -------- */
        await db
            .update(vendorBookingsTable)
            .set({ paymentId: payment.id })
            .where(eq(vendorBookingsTable.id, booking.id));

        return NextResponse.json({
            key: process.env.RAZORPAY_KEY_ID,
            orderId: order.id,
            amount: advanceInPaise,
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
