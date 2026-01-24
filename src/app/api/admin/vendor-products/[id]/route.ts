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
import { requireAdmin } from "@/lib/admin/requireAdmin";

interface AdminTokenPayload {
    adminId: number;
    role: "admin" | "superadmin";
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        requireAdmin(req);

        const { id } = await params;
        const productId = Number(id);
        if (!Number.isInteger(productId)) {
            return NextResponse.json(
                { error: "Invalid product id" },
                { status: 400 },
            );
        }

        const [product] = await db
            .select()
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.id, productId))
            .limit(1);

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            product,
        });
    } catch (error) {
        console.error("Get Product Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        /* ------------------------------------------------------------------ */
        /*                               ID                                   */
        /* ------------------------------------------------------------------ */
        const { id } = await params;
        const productId = Number(id);
        if (!Number.isInteger(productId)) {
            return NextResponse.json(
                { error: "Invalid product id" },
                { status: 400 },
            );
        }

        /* ------------------------------------------------------------------ */
        /*                              AUTH                                  */
        /* ------------------------------------------------------------------ */
        const token = req.cookies.get("admin_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!,
        ) as AdminTokenPayload;

        if (!["admin", "superadmin"].includes(decoded.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        /* ------------------------------------------------------------------ */
        /*                         FETCH PRODUCT                               */
        /* ------------------------------------------------------------------ */
        const [existingProduct] = await db
            .select()
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.id, productId));

        if (!existingProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        /* ------------------------------------------------------------------ */
        /*                         FETCH VENDOR                                */
        /* ------------------------------------------------------------------ */
        const [vendor] = await db
            .select({
                email: vendorsTable.email,
                businessName: vendorsTable.businessName,
                isApproved: vendorsTable.isApproved,
            })
            .from(vendorsTable)
            .where(eq(vendorsTable.id, existingProduct.vendorId));

        if (!vendor || !vendor.isApproved) {
            return NextResponse.json(
                { error: "Vendor is not approved" },
                { status: 400 },
            );
        }

        /* ------------------------------------------------------------------ */
        /*                               BODY                                  */
        /* ------------------------------------------------------------------ */
        const body = await req.json();

        const {
            title,
            description,
            images,
            featuredImageIndex,

            basePriceSingleDay,
            basePriceMultiDay,
            pricingUnit,

            advanceType,
            advanceValue,

            isFeatured,
            isActive,
        } = body;

        /* ------------------------------------------------------------------ */
        /*                         PRICE VALIDATION                            */
        /* ------------------------------------------------------------------ */
        const resolvedSingle =
            basePriceSingleDay !== undefined
                ? Number(basePriceSingleDay)
                : Number(existingProduct.basePriceSingleDay);

        const resolvedMulti =
            basePriceMultiDay !== undefined
                ? Number(basePriceMultiDay)
                : Number(existingProduct.basePriceMultiDay);

        if (resolvedSingle <= 0 || resolvedMulti <= 0) {
            return NextResponse.json(
                { error: "Prices must be greater than zero" },
                { status: 400 },
            );
        }

        /* ------------------------------------------------------------------ */
        /*                       ADVANCE NORMALIZATION                         */
        /* ------------------------------------------------------------------ */
        const resolvedAdvanceType = advanceType ?? existingProduct.advanceType;

        const normalizedAdvanceValue =
            advanceValue !== undefined && advanceValue !== null
                ? Number(advanceValue)
                : Number(existingProduct.advanceValue);

        if (isNaN(normalizedAdvanceValue)) {
            return NextResponse.json(
                { error: "Advance value must be a valid number" },
                { status: 400 },
            );
        }

        const maxBasePrice = Math.max(resolvedSingle, resolvedMulti);

        if (resolvedAdvanceType === "PERCENTAGE") {
            if (normalizedAdvanceValue <= 0 || normalizedAdvanceValue > 100) {
                return NextResponse.json(
                    {
                        error: "Advance percentage must be between 1 and 100",
                    },
                    { status: 400 },
                );
            }
        }

        if (resolvedAdvanceType === "FIXED") {
            if (
                normalizedAdvanceValue <= 0 ||
                normalizedAdvanceValue >= maxBasePrice
            ) {
                return NextResponse.json(
                    {
                        error: "Fixed advance must be greater than 0 and less than product price",
                    },
                    { status: 400 },
                );
            }
        }

        /* ------------------------------------------------------------------ */
        /*                         IMAGE VALIDATION                            */
        /* ------------------------------------------------------------------ */
        const finalImages = images ?? existingProduct.images;

        if (!Array.isArray(finalImages) || finalImages.length === 0) {
            return NextResponse.json(
                { error: "At least one image is required" },
                { status: 400 },
            );
        }

        const finalFeaturedIndex =
            featuredImageIndex ?? existingProduct.featuredImageIndex;

        if (
            finalFeaturedIndex < 0 ||
            finalFeaturedIndex >= finalImages.length
        ) {
            return NextResponse.json(
                { error: "Invalid featuredImageIndex" },
                { status: 400 },
            );
        }

        /* ------------------------------------------------------------------ */
        /*                           UPDATE                                   */
        /* ------------------------------------------------------------------ */
        const [updatedProduct] = await db
            .update(vendorProductsTable)
            .set({
                title: title ?? existingProduct.title,
                description:
                    description !== undefined
                        ? description
                        : existingProduct.description,

                images: finalImages,
                featuredImageIndex: finalFeaturedIndex,

                basePriceSingleDay: resolvedSingle.toFixed(2),
                basePriceMultiDay: resolvedMulti.toFixed(2),

                pricingUnit:
                    pricingUnit === "PER_EVENT" ? "PER_EVENT" : "PER_DAY",

                advanceType: resolvedAdvanceType,
                advanceValue: normalizedAdvanceValue.toFixed(2),

                isFeatured: isFeatured ?? existingProduct.isFeatured,
                isActive: isActive ?? existingProduct.isActive,

                updatedAt: new Date(),
            })
            .where(eq(vendorProductsTable.id, productId))
            .returning();

        /* ------------------------------------------------------------------ */
        /*                               EMAIL                                  */
        /* ------------------------------------------------------------------ */
        await sendEmail({
            to: vendor.email,
            subject: "Your Product Has Been Updated",
            html: vendorProductUpdatedTemplate(
                vendor.businessName,
                updatedProduct.title,
                updatedProduct.uuid,
            ),
        });

        /* ------------------------------------------------------------------ */
        /*                             RESPONSE                                */
        /* ------------------------------------------------------------------ */
        return NextResponse.json(
            {
                success: true,
                product: updatedProduct,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Update Product Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = await params;
        const productId = Number(id);

        if (!Number.isInteger(productId)) {
            return NextResponse.json(
                { error: "Invalid product id" },
                { status: 400 },
            );
        }

        /* ---------- AUTH ---------- */
        const token = req.cookies.get("admin_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!,
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
                { status: 404 },
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
                    ]),
                ),
            )
            .limit(1);

        if (activeBooking.length > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete product with active or upcoming bookings",
                },
                { status: 409 },
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
                { status: 404 },
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
                product.title,
            ),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Product deleted successfully",
                productId,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Safe Delete Product Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
