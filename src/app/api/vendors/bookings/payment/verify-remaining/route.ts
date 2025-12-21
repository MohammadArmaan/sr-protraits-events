// src/app/api/vendors/bookings/payment/verify-remaining/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";

import { vendorPaymentsTable } from "@/config/vendorPaymentsSchema";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorsTable } from "@/config/vendorsSchema";

import { sendEmail } from "@/lib/sendEmail";
import { generateInvoicePdf } from "@/lib/invoice-templates/generateInvoicePdf";
import { vendorInvoiceTemplate } from "@/lib/invoice-templates/vendorInvoiceTemplate";
import { remainingPaymentCompletedTemplate } from "@/lib/email-templates/remainingPaymentCompletedTemplate";
import { requesterPaymentCompletedTemplate } from "@/lib/email-templates/requesterPaymentCompletedTemplate";
import { vendorProductsTable } from "@/config/vendorProductsSchema";

export async function POST(req: NextRequest) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            await req.json();

        /* ----------------------------------
           1️⃣ VERIFY SIGNATURE
        ---------------------------------- */
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: "Invalid payment signature" },
                { status: 400 }
            );
        }

        /* ----------------------------------
           2️⃣ COMPLETE REMAINING PAYMENT
        ---------------------------------- */
        const [remainingPayment] = await db
            .update(vendorPaymentsTable)
            .set({
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: "COMPLETED",
                updatedAt: new Date(),
            })
            .where(eq(vendorPaymentsTable.razorpayOrderId, razorpay_order_id))
            .returning();

        if (!remainingPayment) {
            return NextResponse.json(
                { error: "Remaining payment not found" },
                { status: 404 }
            );
        }

        /* ----------------------------------
   3️⃣ FETCH BOOKING (STRICT & CORRECT)
---------------------------------- */
        const [booking] = await db
            .select()
            .from(vendorBookingsTable)
            .where(
                eq(
                    vendorBookingsTable.vendorProductId,
                    remainingPayment.vendorProductId
                )
            );

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }
        if (!booking.paymentId) {
            return NextResponse.json(
                { error: "Advance payment missing" },
                { status: 400 }
            );
        }

        /* ----------------------------------
           4️⃣ FETCH ADVANCE PAYMENT (ONLY THIS BOOKING)
        ---------------------------------- */
        const [advancePayment] = await db
            .select()
            .from(vendorPaymentsTable)
            .where(eq(vendorPaymentsTable.id, booking.paymentId));

        if (!advancePayment || advancePayment.status !== "PAID") {
            return NextResponse.json(
                { error: "Advance payment not completed" },
                { status: 400 }
            );
        }

        /* ----------------------------------
           5️⃣ RECONCILE USING BOOKING FIELDS (FINAL)
        ---------------------------------- */
        const advanceAmount = advancePayment.amount / 100;
        const remainingAmount = remainingPayment.amount / 100;

        const totalPaid = advanceAmount + remainingAmount;

        const finalAmount =
            Number(booking.totalAmount) - Number(booking.discountAmount);

        if (Number(totalPaid.toFixed(2)) !== Number(finalAmount.toFixed(2))) {
            console.error("❌ Settlement mismatch", {
                bookingUuid: booking.uuid,
                advanceAmount,
                remainingAmount,
                totalPaid,
                finalAmount,
            });

            return NextResponse.json(
                { error: "Payment mismatch. Settlement aborted." },
                { status: 400 }
            );
        }

        /* ----------------------------------
           6️⃣ MARK BOOKING COMPLETED
        ---------------------------------- */
        const [updatedBooking] = await db
            .update(vendorBookingsTable)
            .set({
                status: "COMPLETED",
                remainingAmount: "0",
                updatedAt: new Date(),
            })
            .where(eq(vendorBookingsTable.id, booking.id))
            .returning();

        /* ----------------------------------
           7️⃣ FETCH PARTIES
        ---------------------------------- */
        const [[requester], [provider]] = await Promise.all([
            db
                .select()
                .from(vendorsTable)
                .where(eq(vendorsTable.id, booking.bookedByVendorId)),

            db
                .select()
                .from(vendorsTable)
                .where(eq(vendorsTable.id, booking.vendorId)),
        ]);

        /* ----------------------------------
           8️⃣ INVOICE
        ---------------------------------- */
        const invoiceHtml = vendorInvoiceTemplate({
            invoiceNumber: updatedBooking.uuid,
            bookingDate: new Date().toLocaleDateString(),

            productTitle: updatedBooking.uuid,
            bookingType: updatedBooking.bookingType,
            startDate: updatedBooking.startDate,
            endDate: updatedBooking.endDate,
            totalDays: updatedBooking.totalDays,

            basePrice: Number(updatedBooking.totalAmount),
            discountAmount: Number(updatedBooking.discountAmount),
            finalAmount,

            advanceAmount,
            remainingAmount: 0,

            requester: {
                name: requester.businessName,
                email: requester.email,
                phone: requester.phone,
                address: requester.address,
                profilePhoto: requester.profilePhoto,
            },
            provider: {
                name: provider.businessName,
                email: provider.email,
                phone: provider.phone,
                address: provider.address,
                profilePhoto: provider.profilePhoto,
            },
        });

        const invoicePdf = await generateInvoicePdf(invoiceHtml);

        await sendEmail({
            to: provider.email,
            subject: "Booking Settled – Payment Completed ✅",
            html: remainingPaymentCompletedTemplate(
                provider.businessName,
                updatedBooking.uuid
            ),
            attachments: [
                {
                    filename: `Invoice-${updatedBooking.uuid}.pdf`,
                    content: invoicePdf,
                    contentType: "application/pdf",
                },
            ],
        });

        /* ----------------------------------
           8️⃣ FETCH PRODUCT AND SEND EMAIL TO REQUESTER
        ---------------------------------- */

        const [product] = await db
            .select({
                uuid: vendorProductsTable.uuid,
            })
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.id, booking.vendorProductId));

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        await sendEmail({
            to: requester.email,
            subject: "Your Booking Is Completed – Share Your Experience 🌟",
            html: requesterPaymentCompletedTemplate({
                requesterName: requester.businessName,
                bookingRef: updatedBooking.uuid,
                productUuid: product.uuid,
            }),
            attachments: [
                {
                    filename: `Invoice-${updatedBooking.uuid}.pdf`,
                    content: invoicePdf,
                    contentType: "application/pdf",
                },
            ],
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Verify remaining payment error:", err);
        return NextResponse.json(
            { error: "Remaining payment verification failed" },
            { status: 500 }
        );
    }
}
