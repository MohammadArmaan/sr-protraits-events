// src/app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { couponCodesTable } from "@/config/couponCodeSchema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    const { code, amount } = await req.json();

    if (!code || !amount) {
        return NextResponse.json(
            { error: "Code and amount required" },
            { status: 400 }
        );
    }

    const [coupon] = await db
        .select()
        .from(couponCodesTable)
        .where(
            and(
                eq(couponCodesTable.code, code.toUpperCase()),
                eq(couponCodesTable.isActive, true)
            )
        );

    if (!coupon) {
        return NextResponse.json(
            { error: "Invalid coupon" },
            { status: 400 }
        );
    }

    let discount = 0;

    if (coupon.type === "FLAT") {
        discount = Number(coupon.value);
    }

    if (coupon.type === "PERCENT") {
        discount = Math.round((amount * Number(coupon.value)) / 100);
    }

    if (coupon.type === "UPTO") {
        const percent = Math.round((amount * Number(coupon.value)) / 100);
        discount = coupon.maxDiscount
            ? Math.min(percent, Number(coupon.maxDiscount))
            : percent;
    }

    discount = Math.min(discount, amount);

    return NextResponse.json({
        code: coupon.code,
        discountAmount: discount,
        finalAmount: amount - discount,
    });
}
