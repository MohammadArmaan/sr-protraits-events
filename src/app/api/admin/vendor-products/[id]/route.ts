import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { and, eq, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/lib/sendEmail";
import { vendorProductUpdatedTemplate } from "@/lib/email-templates/vendorProductUpdatedTemplate";
import { vendorProductDeletedEmailTemplate } from "@/lib/email-templates/vendorProductDeletedTemplate";
import { vendorBookingsTable } from "@/config/vendorBookingsSchema";

interface AdminTokenPayload {
    adminId: number;
    role: "admin" | "superadmin";
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const productId = Number(id);

        if (!Number.isInteger(productId)) {
            return NextResponse.json(
                { error: "Invalid product id" },
                { status: 400 }
            );
        }

        /* ---------- AUTH ---------- */
        const token = req.cookies.get("admin_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as AdminTokenPayload;

        if (!["admin", "superadmin"].includes(decoded.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        /* ---------- FETCH PRODUCT ---------- */
        const [product] = await db
            .select()
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.id, productId));

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        /* ---------- FETCH VENDOR ---------- */
        const [vendor] = await db
            .select({
                email: vendorsTable.email,
                businessName: vendorsTable.businessName,
                isApproved: vendorsTable.isApproved,
            })
            .from(vendorsTable)
            .where(eq(vendorsTable.id, product.vendorId));

        if (!vendor || !vendor.isApproved) {
            return NextResponse.json(
                { error: "Vendor is not approved" },
                { status: 400 }
            );
        }

        /* ---------- BODY ---------- */
        const {
            title,
            description,
            basePriceSingleDay,
            basePriceMultiDay,
            pricingUnit,
            advanceType,
            advanceValue,
            isFeatured,
            isActive,
            images,
            featuredImageIndex,
        } = await req.json();

        /* ---------- PRICE VALIDATION ---------- */
        const resolvedSingle = basePriceSingleDay ?? product.basePriceSingleDay;
        const resolvedMulti = basePriceMultiDay ?? product.basePriceMultiDay;

        if (resolvedSingle <= 0 || resolvedMulti <= 0) {
            return NextResponse.json(
                { error: "Prices must be greater than zero" },
                { status: 400 }
            );
        }

        /* ---------- ADVANCE VALIDATION (ONLY IF CHANGED) ---------- */
        const isAdvanceTouched =
            advanceType !== undefined || advanceValue !== undefined;

        if (isAdvanceTouched) {
            const resolvedAdvanceType = advanceType ?? product.advanceType;
            const resolvedAdvanceValue = advanceValue ?? product.advanceValue;

            const maxBasePrice = Math.max(
                basePriceSingleDay ?? product.basePriceSingleDay,
                basePriceMultiDay ?? product.basePriceMultiDay
            );

            if (resolvedAdvanceType === "PERCENTAGE") {
                if (
                    typeof resolvedAdvanceValue !== "number" ||
                    resolvedAdvanceValue <= 0 ||
                    resolvedAdvanceValue > 100
                ) {
                    return NextResponse.json(
                        {
                            error: "Advance percentage must be between 1 and 100",
                        },
                        { status: 400 }
                    );
                }
            }

            if (resolvedAdvanceType === "FIXED") {
                if (
                    typeof resolvedAdvanceValue !== "number" ||
                    resolvedAdvanceValue <= 0 ||
                    resolvedAdvanceValue >= maxBasePrice
                ) {
                    return NextResponse.json(
                        {
                            error: "Fixed advance must be greater than 0 and less than product price",
                        },
                        { status: 400 }
                    );
                }
            }
        }

        /* ---------- IMAGE VALIDATION ---------- */
        const finalImages = images ?? product.images;

        if (!Array.isArray(finalImages) || finalImages.length === 0) {
            return NextResponse.json(
                { error: "Images must be a non-empty array" },
                { status: 400 }
            );
        }

        const finalFeaturedIndex =
            featuredImageIndex ?? product.featuredImageIndex;

        if (
            finalFeaturedIndex < 0 ||
            finalFeaturedIndex >= finalImages.length
        ) {
            return NextResponse.json(
                { error: "Invalid featuredImageIndex" },
                { status: 400 }
            );
        }

        /* ---------- BUILD UPDATE ---------- */
        const updateData: Partial<typeof vendorProductsTable.$inferInsert> = {
            updatedAt: new Date(),
        };

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        if (basePriceSingleDay !== undefined)
            updateData.basePriceSingleDay = basePriceSingleDay;

        if (basePriceMultiDay !== undefined)
            updateData.basePriceMultiDay = basePriceMultiDay;

        if (pricingUnit !== undefined)
            updateData.pricingUnit =
                pricingUnit === "PER_EVENT" ? "PER_EVENT" : "PER_DAY";

        if (advanceType !== undefined) updateData.advanceType = advanceType;

        if (advanceValue !== undefined) updateData.advanceValue = advanceValue;

        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

        if (isActive !== undefined) updateData.isActive = isActive;

        if (images !== undefined) updateData.images = images;

        if (featuredImageIndex !== undefined)
            updateData.featuredImageIndex = featuredImageIndex;

        /* ---------- UPDATE ---------- */
        await db
            .update(vendorProductsTable)
            .set(updateData)
            .where(eq(vendorProductsTable.id, productId));

        /* ---------- EMAIL ---------- */
        await sendEmail({
            to: vendor.email,
            subject: "Your Product Has Been Updated",
            html: vendorProductUpdatedTemplate(
                vendor.businessName,
                product.title,
                product.uuid
            ),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Product updated successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update Product Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const productId = Number(id);

        if (!Number.isInteger(productId)) {
            return NextResponse.json(
                { error: "Invalid product id" },
                { status: 400 }
            );
        }

        /* ---------- AUTH ---------- */
        const token = req.cookies.get("admin_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as AdminTokenPayload;

        if (!["admin", "superadmin"].includes(decoded.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        /* ---------- FETCH PRODUCT ---------- */
        const [product] = await db
            .select({
                id: vendorProductsTable.id,
                title: vendorProductsTable.title,
                uuid: vendorProductsTable.uuid,
                vendorId: vendorProductsTable.vendorId,
            })
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.id, productId));

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        /* ---------- CHECK ACTIVE BOOKINGS ---------- */
        const activeBooking = await db
            .select({ id: vendorBookingsTable.id })
            .from(vendorBookingsTable)
            .where(
                and(
                    eq(vendorBookingsTable.vendorProductId, productId),
                    inArray(vendorBookingsTable.status, [
                        "REQUESTED",
                        "APPROVED",
                        "PAYMENT_PENDING",
                        "CONFIRMED",
                    ])
                )
            )
            .limit(1);

        if (activeBooking.length > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete product with active or upcoming bookings",
                },
                { status: 409 }
            );
        }

        /* ---------- FETCH VENDOR ---------- */
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

        /* ---------- DELETE PRODUCT ---------- */
        await db
            .delete(vendorProductsTable)
            .where(eq(vendorProductsTable.id, productId));

        /* ---------- SEND EMAIL ---------- */
        await sendEmail({
            to: vendor.email,
            subject: "Product Removed from Vendor Listing",
            html: vendorProductDeletedEmailTemplate(
                vendor.businessName,
                product.title
            ),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Product deleted successfully",
                productId,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Safe Delete Product Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
