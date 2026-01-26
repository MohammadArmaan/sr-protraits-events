import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/config/db";
import { vendorPaymentsTable } from "@/config/vendorPaymentsSchema";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { and, eq, sum } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json(
                { error: "Missing signature" },
                { status: 400 },
            );
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest("hex");

        if (signature !== expectedSignature) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 },
            );
        }

        const payload = JSON.parse(body);

        /* =====================================================
       PAYMENT CAPTURED
       ===================================================== */
        if (payload.event === "payment.captured") {
            const paymentEntity = payload.payload.payment.entity;

            const razorpayOrderId = paymentEntity.order_id;
            const razorpayPaymentId = paymentEntity.id;
            const bookingUuid = paymentEntity.receipt; // 🔥 KEY

            /* 1️⃣ Mark payment as PAID (idempotent) */
            const [payment] = await db
                .update(vendorPaymentsTable)
                .set({
                    status: "PAID",
                    razorpayPaymentId,
                    razorpaySignature: signature,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(
                            vendorPaymentsTable.razorpayOrderId,
                            razorpayOrderId,
                        ),
                        eq(vendorPaymentsTable.status, "CREATED"),
                    ),
                )
                .returning();

            if (!payment) {
                return NextResponse.json({ ok: true });
            }

            /* 2️⃣ Fetch booking using receipt */
            const [booking] = await db
                .select()
                .from(vendorBookingsTable)
                .where(eq(vendorBookingsTable.uuid, bookingUuid));

            if (!booking) {
                return NextResponse.json({ ok: true });
            }

            /* 3️⃣ Sum all PAID payments for this booking */
            const [{ totalPaid }] = await db
                .select({
                    totalPaid: sum(vendorPaymentsTable.amount),
                })
                .from(vendorPaymentsTable)
                .where(
                    and(
                        eq(vendorPaymentsTable.status, "PAID"),
                        eq(
                            vendorPaymentsTable.vendorProductId,
                            booking.vendorProductId,
                        ),
                        eq(vendorPaymentsTable.vendorId, booking.vendorId),
                    ),
                );

            /* 4️⃣ If fully paid → mark this payment as COMPLETED */
            if (Number(totalPaid) >= Number(booking.finalAmount) * 100) {
                await db
                    .update(vendorPaymentsTable)
                    .set({
                        status: "COMPLETED",
                        updatedAt: new Date(),
                    })
                    .where(eq(vendorPaymentsTable.id, payment.id));
            }
        }

        /* =====================================================
       PAYMENT FAILED
       ===================================================== */
        if (payload.event === "payment.failed") {
            const paymentEntity = payload.payload.payment.entity;

            await db
                .update(vendorPaymentsTable)
                .set({
                    status: "FAILED",
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(
                            vendorPaymentsTable.razorpayOrderId,
                            paymentEntity.order_id,
                        ),
                        eq(vendorPaymentsTable.status, "CREATED"),
                    ),
                );
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Razorpay webhook error:", err);
        return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
    }
}
