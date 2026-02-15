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
import { vendorProductImagesTable } from "@/config/vendorProductImageSchema";

interface AdminTokenPayload {
    adminId: number;
    role: "admin" | "superadmin";
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    try {
        /* ---------------- AUTH ---------------- */
        await requireAdmin(req);

        /* ---------------- PARAM ---------------- */
        const { id } = await context.params;
        const productId = Number(id);

        if (!Number.isInteger(productId)) {
            return NextResponse.json(
                { error: "Invalid product id" },
                { status: 400 },
            );
        }

        /* ---------------- FETCH PRODUCT ---------------- */
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

        /* ---------------- FETCH PRODUCT IMAGES ---------------- */
        const images = await db
            .select({
                id: vendorProductImagesTable.id,
                catalogId: vendorProductImagesTable.catalogId,
                imageUrl: vendorProductImagesTable.imageUrl,
                isFeatured: vendorProductImagesTable.isFeatured,
                sortOrder: vendorProductImagesTable.sortOrder,
            })
            .from(vendorProductImagesTable)
            .where(eq(vendorProductImagesTable.productId, productId));

        /* ---------------- GROUP BY CATALOG ---------------- */
        const imagesByCatalog: Record<
            number,
            {
                images: typeof images;
                featuredImageId: number | null;
            }
        > = {};

        for (const img of images) {
            if (!imagesByCatalog[img.catalogId]) {
                imagesByCatalog[img.catalogId] = {
                    images: [],
                    featuredImageId: null,
                };
            }

            imagesByCatalog[img.catalogId].images.push(img);

            if (img.isFeatured) {
                imagesByCatalog[img.catalogId].featuredImageId = img.id;
            }
        }

        /* ---------------- SORT IMAGES ---------------- */
        Object.values(imagesByCatalog).forEach((group) => {
            group.images.sort(
                (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
            );
        });

        /* ---------------- CATALOG IDS ---------------- */
        const catalogIds = Object.keys(imagesByCatalog).map(Number);

        /* ---------------- RESPONSE ---------------- */
        return NextResponse.json(
            {
                success: true,
                product,
                catalogIds,
                imagesByCatalog,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Get Product Error:", error);

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


export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    try {
        /* ---------------- ID ---------------- */
        const { id } = await context.params;
        const productId = Number(id);

        if (!Number.isInteger(productId)) {
            return NextResponse.json(
                { error: "Invalid product id" },
                { status: 400 },
            );
        }

        /* ---------------- AUTH ---------------- */
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
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 },
            );
        }

        /* ---------------- FETCH PRODUCT ---------------- */
        const [existingProduct] = await db
            .select()
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.id, productId))
            .limit(1);

        if (!existingProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        /* ---------------- BODY ---------------- */
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
            isPriority,
            isSessionBased,
        } = await req.json();

        /* ---------------- PRICE NORMALIZATION ---------------- */
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

        /* ---------------- ADVANCE NORMALIZATION ---------------- */
        const resolvedAdvanceType =
            advanceType ?? existingProduct.advanceType;

        const normalizedAdvanceValue =
            advanceValue !== undefined && advanceValue !== null
                ? Number(advanceValue)
                : Number(existingProduct.advanceValue);

        if (Number.isNaN(normalizedAdvanceValue)) {
            return NextResponse.json(
                { error: "Advance value must be a valid number" },
                { status: 400 },
            );
        }

        if (
            resolvedAdvanceType === "PERCENTAGE" &&
            (normalizedAdvanceValue <= 0 || normalizedAdvanceValue > 100)
        ) {
            return NextResponse.json(
                { error: "Advance percentage must be between 1 and 100" },
                { status: 400 },
            );
        }

        if (
            resolvedAdvanceType === "FIXED" &&
            normalizedAdvanceValue >= Math.max(resolvedSingle, resolvedMulti)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Fixed advance must be less than the product price",
                },
                { status: 400 },
            );
        }

        /* ---------------- UPDATE PRODUCT ---------------- */
        const [updatedProduct] = await db
            .update(vendorProductsTable)
            .set({
                title: title ?? existingProduct.title,
                description:
                    description !== undefined
                        ? description
                        : existingProduct.description,

                basePriceSingleDay: resolvedSingle.toFixed(2),
                basePriceMultiDay: resolvedMulti.toFixed(2),

                pricingUnit: isSessionBased ? "PER_EVENT" : "PER_DAY",

                advanceType: resolvedAdvanceType,
                advanceValue: normalizedAdvanceValue.toFixed(2),

                isFeatured: isFeatured ?? existingProduct.isFeatured,
                isActive: isActive ?? existingProduct.isActive,
                isPriority: isPriority ?? existingProduct.isPriority,

                isSessionBased:
                    isSessionBased ?? existingProduct.isSessionBased,

                maxSessionHours: isSessionBased ? 8 : null,
                updatedAt: new Date(),
            })
            .where(eq(vendorProductsTable.id, productId))
            .returning();

        return NextResponse.json(
            { success: true, product: updatedProduct },
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
    context: { params: Promise<{ id: string }> },
) {
    try {
        /* ---------------- ID ---------------- */
        const { id } = await context.params;
        const productId = Number(id);

        if (!Number.isInteger(productId)) {
            return NextResponse.json(
                { error: "Invalid product id" },
                { status: 400 },
            );
        }

        /* ---------------- AUTH ---------------- */
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
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 },
            );
        }

        /* ---------------- FETCH PRODUCT ---------------- */
        const [product] = await db
            .select({
                id: vendorProductsTable.id,
                title: vendorProductsTable.title,
                uuid: vendorProductsTable.uuid,
                vendorId: vendorProductsTable.vendorId,
                businessName: vendorProductsTable.businessName,
            })
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.id, productId))
            .limit(1);

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        /* ---------------- CHECK ACTIVE BOOKINGS ---------------- */
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
                    error:
                        "Cannot delete product with active or upcoming bookings",
                },
                { status: 409 },
            );
        }

        /* ---------------- FETCH VENDOR ---------------- */
        const [vendor] = await db
            .select({
                email: vendorsTable.email,
                businessName: vendorsTable.businessName,
                fullName: vendorsTable.fullName,
                isApproved: vendorsTable.isApproved,
            })
            .from(vendorsTable)
            .where(eq(vendorsTable.id, product.vendorId))
            .limit(1);

        if (!vendor || !vendor.isApproved) {
            return NextResponse.json(
                { error: "Vendor not approved or not found" },
                { status: 400 },
            );
        }

        const resolvedBusinessName =
            product.businessName ??
            vendor.businessName ??
            vendor.fullName;

        /* ---------------- DELETE PRODUCT ---------------- */
        await db
            .delete(vendorProductsTable)
            .where(eq(vendorProductsTable.id, productId));

        /* ---------------- EMAIL ---------------- */
        await sendEmail({
            to: vendor.email,
            subject: "Product Removed from Vendor Listing",
            html: vendorProductDeletedEmailTemplate(
                resolvedBusinessName,
                product.title,
            ),
        });

        /* ---------------- RESPONSE ---------------- */
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


