// src/app/api/admin/vendor-products/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { eq, inArray } from "drizzle-orm";

import { db } from "@/config/db";
import { vendorProductsTable } from "@/config/vendorProductsSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorBankDetailsTable } from "@/config/vendorBankDetailsSchema";
import { vendorCatalogsTable } from "@/config/vendorCatalogSchema";
import { vendorCatalogImagesTable } from "@/config/vendorCatalogImagesSchema";
import { vendorProductImagesTable } from "@/config/vendorProductImageSchema";

import { sendEmail } from "@/lib/sendEmail";
import { vendorProductCreatedTemplate } from "@/lib/email-templates/vendorProductCreatedTemplate";

interface AdminTokenPayload {
    adminId: number;
    role: "admin" | "superadmin";
}

export async function POST(req: NextRequest) {
    try {
        /* ------------------------------------------------------------------ */
        /* AUTH                                                               */
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
        /* BODY                                                               */
        /* ------------------------------------------------------------------ */
        const {
            vendorId,
            catalogIds,
            featuredImageByCatalog,

            title,
            description,

            basePriceSingleDay,
            basePriceMultiDay,

            pricingUnit,
            advanceType,
            advanceValue,

            isSessionBased,
            isFeatured,
            isPriority,
            isActive,
        } = await req.json();

        /* ------------------------------------------------------------------ */
        /* BASIC VALIDATION                                                    */
        /* ------------------------------------------------------------------ */
        if (
            !vendorId ||
            !Array.isArray(catalogIds) ||
            catalogIds.length === 0 ||
            !title ||
            typeof basePriceSingleDay !== "number"
        ) {
            return NextResponse.json(
                { error: "Missing or invalid required fields" },
                { status: 400 },
            );
        }

        if (!isSessionBased && typeof basePriceMultiDay !== "number") {
            return NextResponse.json(
                { error: "Multi-day price required" },
                { status: 400 },
            );
        }

        if (
            !featuredImageByCatalog ||
            typeof featuredImageByCatalog !== "object"
        ) {
            return NextResponse.json(
                { error: "featuredImageByCatalog is required" },
                { status: 400 },
            );
        }

        for (const catalogId of catalogIds) {
            if (!featuredImageByCatalog[catalogId]) {
                return NextResponse.json(
                    {
                        error: `Featured image not selected for catalog ${catalogId}`,
                    },
                    { status: 400 },
                );
            }
        }

        /* ------------------------------------------------------------------ */
        /* PAYOUT CHECK                                                        */
        /* ------------------------------------------------------------------ */
        const bankDetails = await db
            .select({ id: vendorBankDetailsTable.id })
            .from(vendorBankDetailsTable)
            .where(eq(vendorBankDetailsTable.vendorId, vendorId))
            .limit(1);

        if (!bankDetails.length) {
            return NextResponse.json(
                { error: "Vendor must complete payout details first" },
                { status: 400 },
            );
        }

        /* ------------------------------------------------------------------ */
        /* FETCH VENDOR                                                        */
        /* ------------------------------------------------------------------ */
        const [vendor] = await db
            .select({
                id: vendorsTable.id,
                fullName: vendorsTable.fullName,
                businessName: vendorsTable.businessName,
                occupation: vendorsTable.occupation,
                email: vendorsTable.email,
                isApproved: vendorsTable.isApproved,
            })
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (!vendor || !vendor.isApproved) {
            return NextResponse.json(
                { error: "Vendor not approved or not found" },
                { status: 400 },
            );
        }

        const resolvedBusinessName = vendor.businessName ?? vendor.fullName;

        /* ------------------------------------------------------------------ */
        /* VALIDATE CATALOGS                                                   */
        /* ------------------------------------------------------------------ */
        const catalogs = await db
            .select({ id: vendorCatalogsTable.id })
            .from(vendorCatalogsTable)
            .where(inArray(vendorCatalogsTable.id, catalogIds));

        if (catalogs.length !== catalogIds.length) {
            return NextResponse.json(
                { error: "One or more catalogs not found" },
                { status: 404 },
            );
        }

                /* ------------------------------------------------------------------ */
        /* FETCH ALL CATALOG IMAGES                                            */
        /* ------------------------------------------------------------------ */
        const catalogImages = await db
            .select({
                id: vendorCatalogImagesTable.id,
                catalogId: vendorCatalogImagesTable.catalogId,
                imageUrl: vendorCatalogImagesTable.imageUrl,
                sortOrder: vendorCatalogImagesTable.sortOrder,
            })
            .from(vendorCatalogImagesTable)
            .where(inArray(vendorCatalogImagesTable.catalogId, catalogIds));

        if (!catalogImages.length) {
            return NextResponse.json(
                { error: "Selected catalogs have no images" },
                { status: 400 },
            );
        }

        const resolvedFeaturedImage = catalogImages.find(
            (img) => featuredImageByCatalog[img.catalogId] === img.id,
        );

        if (!resolvedFeaturedImage) {
            return NextResponse.json(
                { error: "Featured image could not be resolved" },
                { status: 400 },
            );
        }

        const featuredImageUrl = resolvedFeaturedImage.imageUrl;

        /* ------------------------------------------------------------------ */
        /* CREATE PRODUCT                                                      */
        /* ------------------------------------------------------------------ */
        const [product] = await db
            .insert(vendorProductsTable)
            .values({
                vendorId: vendor.id,
                createdByAdminId: decoded.adminId,

                title,
                description: description ?? null,

                businessName: resolvedBusinessName,
                occupation: vendor.occupation,
                featuredImageUrl,

                basePriceSingleDay: basePriceSingleDay.toFixed(2),
                basePriceMultiDay: isSessionBased
                    ? basePriceSingleDay.toFixed(2)
                    : basePriceMultiDay.toFixed(2),

                pricingUnit: isSessionBased ? "PER_EVENT" : "PER_DAY",

                advanceType: advanceType ?? "PERCENTAGE",
                advanceValue:
                    typeof advanceValue === "number"
                        ? advanceValue.toFixed(2)
                        : null,

                isFeatured: Boolean(isFeatured),
                isPriority: Boolean(isPriority),
                isActive: isActive !== false,

                isSessionBased: Boolean(isSessionBased),
                maxSessionHours: isSessionBased ? 8 : null,
            })
            .returning();



        /* ------------------------------------------------------------------ */
        /* INSERT PRODUCT IMAGES                                               */
        /* ------------------------------------------------------------------ */
        const productImages = catalogImages.map((img) => ({
            productId: product.id,
            catalogId: img.catalogId,
            imageUrl: img.imageUrl,
            sortOrder: img.sortOrder ?? 0,
            isFeatured: featuredImageByCatalog[img.catalogId] === img.id,
        }));

        await db.insert(vendorProductImagesTable).values(productImages);

        /* ------------------------------------------------------------------ */
        /* EMAIL                                                              */
        /* ------------------------------------------------------------------ */
        await sendEmail({
            to: vendor.email,
            subject: "New Product Created",
            html: vendorProductCreatedTemplate(
                resolvedBusinessName,
                product.title,
                product.uuid,
            ),
        });

        /* ------------------------------------------------------------------ */
        /* RESPONSE                                                           */
        /* ------------------------------------------------------------------ */
        return NextResponse.json({ success: true, product }, { status: 201 });
    } catch (error) {
        console.error("Create Product Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
