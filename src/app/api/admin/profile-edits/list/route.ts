import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorProfileEdits } from "@/config/vendorProfilesSchema";
import { vendorsTable } from "@/config/vendorsSchema";
import { adminsTable } from "@/config/adminsSchema";
import { vendorCatalogsTable } from "@/config/vendorCatalogSchema";
import { vendorCatalogImagesTable } from "@/config/vendorCatalogImagesSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        /* ---------------------------- AUTH ---------------------------- */

        const token = req.cookies.get("admin_token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: Admin token missing" },
                { status: 401 },
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            adminId: number;
            role: string;
        };

        if (decoded.role !== "admin") {
            return NextResponse.json(
                { error: "Access denied. Admins only." },
                { status: 403 },
            );
        }

        /* ---------------------- FETCH PROFILE EDITS -------------------- */

        const edits = await db
            .select({
                editId: vendorProfileEdits.id,
                vendorId: vendorProfileEdits.vendorId,

                profileChanges: vendorProfileEdits.profileChanges,
                catalogChanges: vendorProfileEdits.catalogChanges,

                newProfilePhotoUrl: vendorProfileEdits.newProfilePhotoUrl,
                oldProfilePhotoUrl: vendorProfileEdits.oldProfilePhotoUrl,

                status: vendorProfileEdits.status,
                createdAt: vendorProfileEdits.createdAt,
                reviewedAt: vendorProfileEdits.reviewedAt,

                vendorName: vendorsTable.fullName,
                vendorBusinessName: vendorsTable.businessName,
                vendorEmail: vendorsTable.email,
                vendorCurrentPhoto: vendorsTable.profilePhoto,

                yearsOfExperience: vendorsTable.yearsOfExperience,
                successfulEventsCompleted:
                    vendorsTable.successfulEventsCompleted,
                gstNumber: vendorsTable.gstNumber,

                approvedBy: adminsTable.fullName,
            })
            .from(vendorProfileEdits)
            .leftJoin(
                vendorsTable,
                eq(vendorProfileEdits.vendorId, vendorsTable.id),
            )
            .leftJoin(
                adminsTable,
                eq(vendorProfileEdits.approvedByAdminId, adminsTable.id),
            )
            .orderBy(vendorProfileEdits.createdAt);

        /* ---------------- ATTACH CATALOGS + IMAGES ---------------- */

        const editsWithCatalogs = await Promise.all(
            edits.map(async (edit) => {
                const catalogs = await db
                    .select({
                        id: vendorCatalogsTable.id,
                        title: vendorCatalogsTable.title,
                        description: vendorCatalogsTable.description,
                    })
                    .from(vendorCatalogsTable)
                    .where(
                        eq(vendorCatalogsTable.vendorId, edit.vendorId),
                    );

                const catalogsWithImages = await Promise.all(
                    catalogs.map(async (catalog) => {
                        const images = await db
                            .select({
                                id: vendorCatalogImagesTable.id,
                                imageUrl:
                                    vendorCatalogImagesTable.imageUrl,
                            })
                            .from(vendorCatalogImagesTable)
                            .where(
                                eq(
                                    vendorCatalogImagesTable.catalogId,
                                    catalog.id,
                                ),
                            );

                        return {
                            ...catalog,
                            images,
                        };
                    }),
                );

                return {
                    ...edit,
                    catalogs: catalogsWithImages,
                };
            }),
        );

        return NextResponse.json(
            { success: true, edits: editsWithCatalogs },
            { status: 200 },
        );
    } catch (error) {
        console.error("List profile edits error:", error);
        return NextResponse.json(
            { error: "Server error fetching profile edits" },
            { status: 500 },
        );
    }
}
