// src/app/api/admin/vendor-products/create/route.ts
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

export async function POST(req: NextRequest) {
    try {
        /* ---------------- AUTH ---------------- */
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

        /* ---------------- BODY ---------------- */
        const {
            vendorId,
            title,
            description,
            images,
            featuredImageIndex,
            basePrice,
            advanceType,
            advanceValue,
            isFeatured,
            isActive,
        } = await req.json();

        if (!vendorId || !title || !basePrice) {
            return NextResponse.json(
                { error: "vendorId, title and basePrice are required" },
                { status: 400 }
            );
        }

        /* ---------------- FETCH VENDOR ---------------- */
        const [vendor] = await db
            .select({
                id: vendorsTable.id,
                businessName: vendorsTable.businessName,
                occupation: vendorsTable.occupation,
                isApproved: vendorsTable.isApproved,
                businessPhotos: vendorsTable.businessPhotos,
            })
            .from(vendorsTable)
            .where(eq(vendorsTable.id, Number(vendorId)));

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );
        }

        /* ------------------ VENDOR APPROVAL CHECK ------------------ */

        if (!vendor.isApproved) {
            return NextResponse.json(
                { error: "Vendor is not approved" },
                { status: 400 }
            );
        }

        /* ------------------ VALIDATE ADVANCE LOGIC ------------------ */

        if (advanceType === "PERCENTAGE") {
            if (
                typeof advanceValue !== "number" ||
                advanceValue <= 0 ||
                advanceValue > 100
            ) {
                return NextResponse.json(
                    { error: "Advance percentage must be between 1 and 100" },
                    { status: 400 }
                );
            }
        }

        if (advanceType === "FIXED") {
            if (
                typeof advanceValue !== "number" ||
                advanceValue <= 0 ||
                advanceValue >= basePrice
            ) {
                return NextResponse.json(
                    {
                        error: "Fixed advance must be greater than 0 and less than base price",
                    },
                    { status: 400 }
                );
            }
        }

        const finalImages = Array.isArray(images)
            ? images
            : vendor.businessPhotos ?? [];

        if (finalImages.length === 0) {
            return NextResponse.json(
                { error: "At least one product image is required" },
                { status: 400 }
            );
        }

        const imageIndex =
            typeof featuredImageIndex === "number" ? featuredImageIndex : 0;

        if (imageIndex < 0 || imageIndex >= finalImages.length) {
            return NextResponse.json(
                { error: "Invalid featured image index" },
                { status: 400 }
            );
        }

        /* ---------------- CREATE PRODUCT ---------------- */
        const [product] = await db
            .insert(vendorProductsTable)
            .values({
                vendorId: vendor.id,
                createdByAdminId: decoded.adminId,

                // snapshot
                businessName: vendor.businessName,
                occupation: vendor.occupation,

                title,
                description: description ?? null,

                images: Array.isArray(images)
                    ? images
                    : vendor.businessPhotos ?? [],

                featuredImageIndex: imageIndex,

                basePrice,
                advanceType: advanceType ?? "PERCENTAGE",
                advanceValue: advanceValue ?? null,

                isFeatured: Boolean(isFeatured),
                isActive: isActive !== false,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Product created successfully",
                product,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create Product Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
