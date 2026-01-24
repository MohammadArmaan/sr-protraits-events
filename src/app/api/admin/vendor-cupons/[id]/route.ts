import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { couponCodesTable } from "@/config/couponCodeSchema";

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    try {
        await requireAdmin(req); // ✅ FIX #2

        const { id } = await context.params; // ✅ FIX #1
        const couponId = Number(id);

        if (!Number.isInteger(couponId)) {
            return NextResponse.json(
                { error: "Invalid coupon id" },
                { status: 400 },
            );
        }

        const body = await req.json();

        const {
            code,
            type,
            value,
            minAmount,
            maxDiscount,
            isActive,
            expiresAt,
        }: {
            code?: string;
            type?: "FLAT" | "PERCENT" | "UPTO";
            value?: number;
            minAmount?: number | null;
            maxDiscount?: number | null;
            isActive?: boolean;
            expiresAt?: string;
        } = body;

        /* ---------- VALIDATION ---------- */
        if (type && !["FLAT", "PERCENT", "UPTO"].includes(type)) {
            return NextResponse.json(
                { error: "Invalid coupon type" },
                { status: 400 },
            );
        }

        if (type === "PERCENT" && value !== undefined && value > 100) {
            return NextResponse.json(
                { error: "Percentage cannot exceed 100" },
                { status: 400 },
            );
        }

        const numberToStringOrUndefined = (
            v: number | null | undefined,
        ): string | undefined => {
            if (v === undefined) return undefined;
            if (v === null) return undefined;
            return v.toString();
        };

        /* ---------- BUILD UPDATE ---------- */
        const updateData: Partial<typeof couponCodesTable.$inferInsert> = {};

        if (code !== undefined) {
            updateData.code = code.toUpperCase();
        }

        if (type !== undefined) {
            updateData.type = type;
        }

        if (value !== undefined) {
            updateData.value = value.toString(); // ✅ string only
        }

        if (minAmount !== undefined) {
            updateData.minAmount = numberToStringOrUndefined(minAmount);
        }

        if (maxDiscount !== undefined) {
            updateData.maxDiscount = numberToStringOrUndefined(maxDiscount);
        }

        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        if (expiresAt !== undefined) {
            updateData.expiresAt = expiresAt ? new Date(expiresAt) : null; // ✅ nullable column
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 },
            );
        }

        /* ---------- UPDATE ---------- */
        const [updated] = await db
            .update(couponCodesTable)
            .set(updateData)
            .where(eq(couponCodesTable.id, couponId))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: "Coupon not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, coupon: updated });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "UNAUTHORIZED") {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }
            if (error.message === "FORBIDDEN") {
                return NextResponse.json(
                    { error: "Forbidden" },
                    { status: 403 },
                );
            }
        }

        console.error("UPDATE COUPON ERROR:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    try {
        requireAdmin(_req);

        const { id } = await context.params;
        const couponId = Number(id);
        if (!Number.isInteger(couponId)) {
            return NextResponse.json(
                { error: "Invalid coupon id" },
                { status: 400 },
            );
        }

        /* ---------- SOFT DELETE ---------- */
        const [deleted] = await db
            .update(couponCodesTable)
            .set({
                isActive: false,
            })
            .where(eq(couponCodesTable.id, couponId))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { error: "Coupon not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Coupon deactivated successfully",
            coupon: deleted,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === "UNAUTHORIZED") {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }

            if (error.message === "FORBIDDEN") {
                return NextResponse.json(
                    { error: "Forbidden" },
                    { status: 403 },
                );
            }
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
