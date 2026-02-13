import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";

import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorProductsTable } from "@/config/vendorProductsSchema";

import {
    generateInvoicePdf,
    InvoiceData,
} from "@/lib/invoice-templates/generateInvoicePdf";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ uuid: string }> },
) {
    try {
        const { uuid } = await context.params;

        const token = req.cookies.get("vendor_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
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
                { status: 404 },
            );
        }

        /* ---------- AUTH GUARD ---------- */
        if (
            booking.vendorId !== decoded.vendorId &&
            booking.bookedByVendorId !== decoded.vendorId
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED") {
            return NextResponse.json(
                { error: "Invoice not available yet" },
                { status: 400 },
            );
        }

        /* ---------- FETCH PARTIES ---------- */
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

        /* ---------- FETCH PRODUCT ---------- */
        const [product] = await db
            .select({ title: vendorProductsTable.title })
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.id, booking.vendorProductId));

        /* ---------- PAYMENT MATH ---------- */
        const finalAmount = Number(booking.finalAmount);
        const advanceAmount = Number(booking.advanceAmount ?? 0);
        const remainingAmount =
            booking.status === "COMPLETED"
                ? 0
                : Math.max(finalAmount - advanceAmount, 0);

        /* ---------- BUILD INVOICE DATA ---------- */
        const invoiceData: InvoiceData = {
            invoiceNumber: booking.uuid,
            issuedAt: new Date(),

            productTitle: product.title,

            basePrice: Number(booking.totalAmount),
            discountAmount: Number(booking.discountAmount),
            finalAmount,

            advanceAmount,
            remainingAmount,

            requester: {
                name: requester.fullName,
                email: requester.email,
                phone: requester.phone,
                address: requester.address,
            },
        };

        const pdfBuffer = await generateInvoicePdf(invoiceData);

        /* ---------- RETURN PDF ---------- */
        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=Invoice-${booking.uuid}.pdf`,
            },
        });
    } catch (err) {
        console.error("Invoice generation error:", err);
        return NextResponse.json(
            { error: "Failed to generate invoice" },
            { status: 500 },
        );
    }
}
