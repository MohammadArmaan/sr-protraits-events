// src/app/api/vendors/bookings/request/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";
import type { InferInsertModel } from "drizzle-orm";
import { eq, and } from "drizzle-orm";
import { couponCodesTable } from "@/config/couponCodeSchema";
import { sendEmail } from "@/lib/sendEmail";
import { bookingRequestVendorTemplate } from "@/lib/email-templates/bookingRequestVendorTemplate";
import { bookingRequestUserTemplate } from "@/lib/email-templates/bookingRequestUserTemplate";
import { vendorsTable } from "@/config/vendorsSchema";

type BookingInsert = InferInsertModel<typeof vendorBookingsTable>;

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
const HOURS_3 = 3 * 60 * 60 * 1000;

function diffDays(start: Date, end: Date) {
    const diff = end.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

// ---- helpers (numeric & date safety for Drizzle/Postgres) ----
const num = (v: number): string => v.toFixed(2);

/**
 * Converts JS Date → "YYYY-MM-DD"
 * Required for Drizzle `date()` columns
 */
const dateOnly = (d: Date): string => d.toISOString().slice(0, 10);

/* ------------------------------------------------ */
/* POST: Booking Request                            */
/* ------------------------------------------------ */
export async function POST(req: NextRequest) {
    try {
        /* ---------------- AUTH (VENDOR) ---------------- */
        const token = req.cookies.get("vendor_token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        let decoded: { vendorId: number };

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                vendorId: number;
            };
        } catch {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        /* ---------------- BODY ---------------- */
        const {
            vendorProductId,
            startDate,
            endDate,
            startTime,
            endTime,
            couponCode,
            notes,
        }: {
            vendorProductId: number;
            startDate: string;
            endDate?: string;
            startTime?: string;
            endTime?: string;
            couponCode?: string;
            notes?: string;
        } = await req.json();

        if (!vendorProductId || !startDate) {
            return NextResponse.json(
                { error: "vendorProductId and startDate are required" },
                { status: 400 }
            );
        }

        /* ---------------- FETCH PRODUCT ---------------- */
        const [product] = await db
            .select()
            .from(vendorProductsTable)
            .where(
                and(
                    eq(vendorProductsTable.id, vendorProductId),
                    eq(vendorProductsTable.isActive, true)
                )
            );

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        /* -------- PREVENT SELF BOOKING -------- */
        if (product.vendorId === decoded.vendorId) {
            return NextResponse.json(
                { error: "You cannot book your own service" },
                { status: 403 }
            );
        }

        /* ---------------- DATE LOGIC ---------------- */
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : start;

        if (end < start) {
            return NextResponse.json(
                { error: "End date cannot be before start date" },
                { status: 400 }
            );
        }

        const bookingType = endDate && end > start ? "MULTI_DAY" : "SINGLE_DAY";

        const totalDays =
            bookingType === "MULTI_DAY" ? diffDays(start, end) : 1;

        /* ---------------- PRICING ---------------- */
        const basePrice =
            bookingType === "MULTI_DAY"
                ? Number(product.basePriceMultiDay)
                : Number(product.basePriceSingleDay);

        const totalAmount =
            bookingType === "MULTI_DAY" ? basePrice * totalDays : basePrice;

        /* ---------------- COUPON ---------------- */
        let discountAmount = 0;
        let appliedCoupon: string | null = null;

        if (couponCode) {
            const [coupon] = await db
                .select()
                .from(couponCodesTable)
                .where(
                    and(
                        eq(couponCodesTable.code, couponCode.toUpperCase()),
                        eq(couponCodesTable.isActive, true)
                    )
                );

            if (!coupon) {
                return NextResponse.json(
                    { error: "Invalid or inactive coupon code" },
                    { status: 400 }
                );
            }

            const now = new Date();

            if (coupon.expiresAt && coupon.expiresAt < now) {
                return NextResponse.json(
                    { error: "Coupon has expired" },
                    { status: 400 }
                );
            }

            if (coupon.minAmount && totalAmount < Number(coupon.minAmount)) {
                return NextResponse.json(
                    {
                        error: `Minimum order amount ₹${coupon.minAmount} required for this coupon`,
                    },
                    { status: 400 }
                );
            }

            // ---- Calculate Discount ----
            if (coupon.type === "FLAT") {
                discountAmount = Number(coupon.value);
            }

            if (coupon.type === "PERCENT") {
                discountAmount = Math.round(
                    (totalAmount * Number(coupon.value)) / 100
                );
            }

            if (coupon.type === "UPTO") {
                const percentDiscount = Math.round(
                    (totalAmount * Number(coupon.value)) / 100
                );

                discountAmount = coupon.maxDiscount
                    ? Math.min(percentDiscount, Number(coupon.maxDiscount))
                    : percentDiscount;
            }

            // Safety clamp
            discountAmount = Math.min(discountAmount, totalAmount);

            if (discountAmount <= 0) {
                return NextResponse.json(
                    { error: "Coupon not applicable" },
                    { status: 400 }
                );
            }

            appliedCoupon = coupon.code;
        }
        const finalAmount = totalAmount - discountAmount;

        /* ---------------- ADVANCE & REMAINING ---------------- */
        let advanceAmount = 0;

        // advance config comes from product
        if (product.advanceType === "PERCENTAGE") {
            advanceAmount = Math.round(
                (finalAmount * Number(product.advanceValue)) / 100
            );
        }

        if (product.advanceType === "FIXED") {
            advanceAmount = Number(product.advanceValue);
        }

        // Safety clamps
        advanceAmount = Math.max(0, Math.min(advanceAmount, finalAmount));

        const remainingAmount = finalAmount - advanceAmount;

        /* ---------------- FETCH BOOKED VENDOR ---------------- */
        const [vendor] = await db
            .select({
                email: vendorsTable.email,
                businessName: vendorsTable.businessName,
            })
            .from(vendorsTable)
            .where(eq(vendorsTable.id, product.vendorId));

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        /* ---------------- FETCH USER (TEMP) ---------------- */
        // Replace this later with usersTable
        const [user] = await db
            .select({
                id: vendorsTable.id,
                email: vendorsTable.email,
                fullName: vendorsTable.fullName,
            })
            .from(vendorsTable)
            .where(eq(vendorsTable.id, decoded.vendorId));

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        /* ---------------- CREATE BOOKING ---------------- */

        const bookingData: BookingInsert = {
            vendorId: product.vendorId,
            vendorProductId: product.id,
            bookedByVendorId: user.id,

            bookingType,

            startDate: dateOnly(start),
            endDate: dateOnly(end),

            startTime: bookingType === "SINGLE_DAY" ? startTime : null,
            endTime: bookingType === "SINGLE_DAY" ? endTime : null,

            basePrice: num(basePrice),
            totalDays,
            totalAmount: num(totalAmount),

            couponCode: appliedCoupon ?? null,
            discountAmount: num(discountAmount),
            finalAmount: num(finalAmount),

            // ✅ NEW (critical)
            advanceAmount: num(advanceAmount),
            remainingAmount: num(remainingAmount),

            status: "REQUESTED",
            approvalExpiresAt: new Date(Date.now() + HOURS_3),

            notes: notes ?? null,
            source: "WEB",
        };

        const [booking] = await db
            .insert(vendorBookingsTable)
            .values(bookingData)
            .returning();

        /* ---------------- EMAIL: VENDOR ---------------- */
        await sendEmail({
            to: vendor.email,
            subject: "New Booking Request – Action Required ⏳",
            html: bookingRequestVendorTemplate(
                vendor.businessName,
                product.title,
                booking.uuid,
                booking.approvalExpiresAt
            ),
        });

        /* ---------------- EMAIL: USER ---------------- */
        await sendEmail({
            to: user.email,
            subject: "Booking Request Sent Successfully ✅",
            html: bookingRequestUserTemplate(user.fullName, product.title),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Booking request sent",
                booking,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Booking Request Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
