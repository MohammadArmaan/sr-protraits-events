import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

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
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, product.vendorId));

        if (!vendor || !vendor.isApproved) {
            return NextResponse.json(
                { error: "Vendor is not approved" },
                { status: 400 }
            );
        }

        /* ---------- BODY ---------- */
        const body = await req.json();

        const {
            title,
            description,
            basePrice,
            advanceType,
            advanceValue,
            isFeatured,
            isActive,
            images,
            featuredImageIndex,
        } = body;

        /* ---------- VALIDATION (only if fields provided) ---------- */

        if (basePrice !== undefined && basePrice <= 0) {
            return NextResponse.json(
                { error: "Base price must be greater than 0" },
                { status: 400 }
            );
        }

        if (advanceType !== undefined) {
            if (!["PERCENTAGE", "FIXED"].includes(advanceType)) {
                return NextResponse.json(
                    { error: "Invalid advance type" },
                    { status: 400 }
                );
            }
        }

        if (
            advanceType === "PERCENTAGE" ||
            product.advanceType === "PERCENTAGE"
        ) {
            const value =
                advanceValue !== undefined
                    ? advanceValue
                    : product.advanceValue;

            const price =
                basePrice !== undefined ? basePrice : product.basePrice;

            if (value <= 0 || value > 100) {
                return NextResponse.json(
                    { error: "Advance percentage must be between 1 and 100" },
                    { status: 400 }
                );
            }
        }

        if (advanceType === "FIXED" || product.advanceType === "FIXED") {
            const value =
                advanceValue !== undefined
                    ? advanceValue
                    : product.advanceValue;

            const price =
                basePrice !== undefined ? basePrice : product.basePrice;

            if (value <= 0 || value >= price) {
                return NextResponse.json(
                    {
                        error: "Fixed advance must be greater than 0 and less than base price",
                    },
                    { status: 400 }
                );
            }
        }

        // Resolve final images set
        const finalImages = images !== undefined ? images : product.images;

        // Validate images if provided
        if (images !== undefined) {
            if (!Array.isArray(images) || images.length === 0) {
                return NextResponse.json(
                    { error: "Images must be a non-empty array" },
                    { status: 400 }
                );
            }
        }

        // Resolve final featured image index
        const finalFeaturedIndex =
            featuredImageIndex !== undefined
                ? featuredImageIndex
                : product.featuredImageIndex;

        // Validate featured image index
        if (
            finalFeaturedIndex < 0 ||
            finalFeaturedIndex >= finalImages.length
        ) {
            return NextResponse.json(
                { error: "Invalid featuredImageIndex for provided images" },
                { status: 400 }
            );
        }

        /* ---------- BUILD UPDATE OBJECT (KEY PART) ---------- */
        const updateData: Partial<typeof vendorProductsTable.$inferInsert> = {
            updatedAt: new Date(),
        };

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (basePrice !== undefined) updateData.basePrice = basePrice;
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

        return NextResponse.json(
            {
                success: true,
                message: "Product updated successfully",
                updatedFields: updateData,
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

        /* ---------- CHECK PRODUCT EXISTS ---------- */
        const [product] = await db
            .select({ id: vendorProductsTable.id })
            .from(vendorProductsTable)
            .where(eq(vendorProductsTable.id, productId));

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        /* ---------- DELETE ---------- */
        await db
            .delete(vendorProductsTable)
            .where(eq(vendorProductsTable.id, productId));

        return NextResponse.json(
            {
                success: true,
                message: "Product deleted successfully",
                productId,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete Product Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
