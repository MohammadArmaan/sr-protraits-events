import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";

import { vendorPaymentsTable } from "@/config/vendorPaymentsSchema";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorProductsTable } from "@/config/vendorProductsSchema";

import { sendEmail } from "@/lib/sendEmail";
import { vendorInvoiceTemplate } from "@/lib/invoice-templates/vendorInvoiceTemplate";
import { generateInvoicePdf } from "@/lib/invoice-templates/generateInvoicePdf";
import { bookingConfirmedRequesterTemplate } from "@/lib/email-templates/bookingConfirmedRequesterTemplate";
import { bookingConfirmedProviderTemplate } from "@/lib/email-templates/bookingConfirmedProviderTemplate";

export async function POST(req: NextRequest) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            await req.json();

        /* ---------- VERIFY SIGNATURE ---------- */
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }

        /* ---------- UPDATE PAYMENT ---------- */
        const [payment] = await db
            .update(vendorPaymentsTable)
            .set({
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: "PAID",
                updatedAt: new Date(),
            })
            .where(eq(vendorPaymentsTable.razorpayOrderId, razorpay_order_id))
            .returning();

        if (!payment) {
            return NextResponse.json(
                { error: "Payment not found" },
                { status: 404 }
            );
        }

        /* ---------- FETCH BOOKING ---------- */
        const [booking] = await db
            .select()
            .from(vendorBookingsTable)
            .where(eq(vendorBookingsTable.paymentId, payment.id));

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        /* ---------- CONFIRM BOOKING ---------- */
        await db
            .update(vendorBookingsTable)
            .set({
                status: "CONFIRMED",
                updatedAt: new Date(),
            })
            .where(eq(vendorBookingsTable.id, booking.id));

        /* ---------- FETCH REQUESTER & PROVIDER ---------- */
        const [[requester], [provider]] = await Promise.all([
            db
                .select({
                    businessName: vendorsTable.businessName,
                    email: vendorsTable.email,
                    phone: vendorsTable.phone,
                    address: vendorsTable.address,
                    profilePhoto: vendorsTable.profilePhoto,
                })
                .from(vendorsTable)
                .where(eq(vendorsTable.id, booking.bookedByVendorId)),

            db
                .select({
                    businessName: vendorsTable.businessName,
                    email: vendorsTable.email,
                    phone: vendorsTable.phone,
                    address: vendorsTable.address,
                    profilePhoto: vendorsTable.profilePhoto,
                })
                .from(vendorsTable)
                .where(eq(vendorsTable.id, booking.vendorId)),
        ]);

        /* ---------- FETCH PRODUCT ---------- */
        const [product] = await db
            .select({ title: vendorProductsTable.title })
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.id, booking.vendorProductId));

        /* ---------- INVOICE ---------- */
        const requesterInvoiceParty = {
            name: requester.businessName,
            email: requester.email,
            phone: requester.phone,
            address: requester.address,
            profilePhoto: requester.profilePhoto,
        };

        const providerInvoiceParty = {
            name: provider.businessName,
            email: provider.email,
            phone: provider.phone,
            address: provider.address,
            profilePhoto: provider.profilePhoto,
        };

        const invoiceHtml = vendorInvoiceTemplate({
            invoiceNumber: booking.uuid,
            bookingDate: new Date().toLocaleDateString(),

            productTitle: product.title,
            bookingType: booking.bookingType,
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalDays: booking.totalDays,

            basePrice: Number(booking.totalAmount),
            discountAmount: Number(booking.discountAmount),
            finalAmount: Number(booking.finalAmount),

            requester: requesterInvoiceParty,
            provider: providerInvoiceParty,
        });

        const invoicePdf = await generateInvoicePdf(invoiceHtml);

        /* ---------- EMAIL: REQUESTER ---------- */
        await sendEmail({
            to: requester.email,
            subject: "Invoice & Booking Confirmed 🧾",
            html: bookingConfirmedRequesterTemplate(
                requester.businessName,
                provider.businessName,
                booking.uuid
            ),
            attachments: [
                {
                    filename: `Invoice-${booking.uuid}.pdf`,
                    content: invoicePdf,
                    contentType: "application/pdf",
                },
            ],
        });

        /* ---------- EMAIL: PROVIDER ---------- */
        await sendEmail({
            to: provider.email,
            subject: "New Booking Confirmed 📅",
            html: bookingConfirmedProviderTemplate(
                provider.businessName,
                requester.businessName
            ),
            attachments: [
                {
                    filename: `Invoice-${booking.uuid}.pdf`,
                    content: invoicePdf,
                    contentType: "application/pdf",
                },
            ],
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Verify payment error:", err);
        return NextResponse.json(
            { error: "Payment verification failed" },
            { status: 500 }
        );
    }
}
