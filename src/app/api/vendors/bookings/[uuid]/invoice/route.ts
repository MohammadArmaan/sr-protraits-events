// src/app/api/vendors/bookings/[uuid]/invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";

import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorProductsTable } from "@/config/vendorProductsSchema";

import { vendorInvoiceTemplate } from "@/lib/invoice-templates/vendorInvoiceTemplate";
import { generateInvoicePdf } from "@/lib/invoice-templates/generateInvoicePdf";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await context.params;
        const token = req.cookies.get("vendor_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            vendorId: number;
        };

        /* ---------- FETCH BOOKING ---------- */
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

        /* ---------- AUTH GUARD ---------- */
        if (
            booking.vendorId !== decoded.vendorId &&
            booking.bookedByVendorId !== decoded.vendorId
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!booking.status) {
            return NextResponse.json(
                { error: "Booking status not available" },
                { status: 400 }
            );
        }

        if (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED") {
            return NextResponse.json(
                { error: "Invoice not available yet" },
                { status: 400 }
            );
        }

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

        /* ---------- PAYMENT MATH ---------- */
        const totalAmount = Number(booking.finalAmount);
        const advanceAmount = Number(booking.advanceAmount ?? 0);
        const remainingAmount =
            booking.status === "COMPLETED"
                ? 0
                : Math.max(totalAmount - advanceAmount, 0);

        /* ---------- INVOICE HTML ---------- */
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
            finalAmount: totalAmount,

            advanceAmount,
            remainingAmount,

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

        const pdfBuffer = await generateInvoicePdf(invoiceHtml);

        /* ---------- RETURN PDF ---------- */
        const pdfBytes = new Uint8Array(pdfBuffer);

        return new NextResponse(pdfBytes, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=Invoice-${booking.uuid}.pdf`,
            },
        });
    } catch (err) {
        console.error("Invoice generation error:", err);
        return NextResponse.json(
            { error: "Failed to generate invoice" },
            { status: 500 }
        );
    }
}
