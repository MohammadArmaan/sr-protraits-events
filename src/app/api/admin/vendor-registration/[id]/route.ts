import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorBankDetailsTable } from "@/config/vendorBankDetailsSchema";
import { vendorCatalogsTable } from "@/config/vendorCatalogSchema";
import { vendorCatalogImagesTable } from "@/config/vendorCatalogImagesSchema";
import { eq, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await context.params;
        const vendorId = Number(id);

        if (!vendorId || Number.isNaN(vendorId)) {
            return NextResponse.json(
                { error: "Invalid vendor id" },
                { status: 400 },
            );
        }

        /* ----------------------------- */
        /* 🔐 Validate Admin Token */
        /* ----------------------------- */
        const token = req.cookies.get("admin_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            adminId: number;
            role: string;
        };

        if (decoded.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden: Admins only" },
                { status: 403 },
            );
        }

        /* ----------------------------- */
        /* ✅ Fetch Vendor */
        /* ----------------------------- */
        const [vendor] = await db
            .select({
                id: vendorsTable.id,
                fullName: vendorsTable.fullName,
                businessName: vendorsTable.businessName,
                occupation: vendorsTable.occupation,
                phone: vendorsTable.phone,
                email: vendorsTable.email,
                address: vendorsTable.address,
                businessDescription: vendorsTable.businessDescription,
                profilePhoto: vendorsTable.profilePhoto,

                // ✅ NEW FIELDS
                yearsOfExperience: vendorsTable.yearsOfExperience,
                successfulEventsCompleted:
                    vendorsTable.successfulEventsCompleted,
                gstNumber: vendorsTable.gstNumber,
                points: vendorsTable.points,
                demandPrice: vendorsTable.demandPrice,

                status: vendorsTable.status,
                isApproved: vendorsTable.isApproved,
                approvedAt: vendorsTable.approvedAt,
                createdAt: vendorsTable.createdAt,
            })
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 },
            );
        }

        /* ----------------------------- */
        /* ✅ Fetch Bank Details */
        /* ----------------------------- */
        const [bankDetails] = await db
            .select({
                accountHolderName: vendorBankDetailsTable.accountHolderName,
                accountNumber: vendorBankDetailsTable.accountNumber,
                ifscCode: vendorBankDetailsTable.ifscCode,
                isPayoutReady: vendorBankDetailsTable.isPayoutReady,
                isEdited: vendorBankDetailsTable.isEdited,
                confirmedAt: vendorBankDetailsTable.confirmedAt,
                pendingChanges: vendorBankDetailsTable.pendingChanges,
                adminApprovedAt: vendorBankDetailsTable.adminApprovedAt,
            })
            .from(vendorBankDetailsTable)
            .where(eq(vendorBankDetailsTable.vendorId, vendorId));

        /* ----------------------------- */
        /* ✅ Fetch Catalogs */
        /* ----------------------------- */
        const catalogs = await db
            .select({
                id: vendorCatalogsTable.id,
                title: vendorCatalogsTable.title,
                description: vendorCatalogsTable.description,
                categoryId: vendorCatalogsTable.categoryId,
                subCategoryId: vendorCatalogsTable.subCategoryId,
                createdAt: vendorCatalogsTable.createdAt,
            })
            .from(vendorCatalogsTable)
            .where(eq(vendorCatalogsTable.vendorId, vendorId));

        /* ----------------------------- */
        /* ✅ Fetch Catalog Images */
        /* ----------------------------- */
        const catalogIds = catalogs.map((c) => c.id);

        const catalogImages =
            catalogIds.length === 0
                ? []
                : await db
                      .select({
                          id: vendorCatalogImagesTable.id,
                          catalogId: vendorCatalogImagesTable.catalogId,
                          imageUrl: vendorCatalogImagesTable.imageUrl,
                      })
                      .from(vendorCatalogImagesTable)
                      .where(
                          inArray(
                              vendorCatalogImagesTable.catalogId,
                              catalogIds,
                          ),
                      );

        /* ----------------------------- */
        /* 🔁 Attach images to catalogs */
        /* ----------------------------- */
        const catalogsWithImages = catalogs.map((catalog) => ({
            ...catalog,
            images: catalogImages.filter((img) => img.catalogId === catalog.id),
        }));

        /* ----------------------------- */
        /* ✅ Final Response */
        /* ----------------------------- */
        return NextResponse.json(
            {
                success: true,
                vendor: {
                    ...vendor,
                    bankDetails: bankDetails ?? null,
                    catalogs: catalogsWithImages,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Vendor details fetch error:", error);
        return NextResponse.json(
            { error: "Server error fetching vendor details" },
            { status: 500 },
        );
    }
}
