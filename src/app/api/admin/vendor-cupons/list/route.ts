import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { couponCodesTable } from "@/config/couponCodeSchema";

export async function GET(req: NextRequest) {
    try {
        requireAdmin(req);

        const coupons = await db
            .select({
                id: couponCodesTable.id,
                uuid: couponCodesTable.uuid,
                code: couponCodesTable.code,
                type: couponCodesTable.type,
                value: couponCodesTable.value,
                minAmount: couponCodesTable.minAmount,
                maxDiscount: couponCodesTable.maxDiscount,
                isActive: couponCodesTable.isActive,
                expiresAt: couponCodesTable.expiresAt,
                createdAt: couponCodesTable.createdAt,
            })
            .from(couponCodesTable)
            .orderBy(desc(couponCodesTable.createdAt));

        return NextResponse.json({
            coupons: coupons.map((c) => ({
                ...c,
                value: Number(c.value),
                minAmount: c.minAmount ? Number(c.minAmount) : null,
                maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
            })),
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === "UNAUTHORIZED") {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }

            if (error.message === "FORBIDDEN") {
                return NextResponse.json(
                    { error: "Forbidden" },
                    { status: 403 }
                );
            }
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
