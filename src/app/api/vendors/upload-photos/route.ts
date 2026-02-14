/**
 * Vendor Registration – Step 4 (Create Catalog + Upload Images)
 */

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorCatalogsTable } from "@/config/vendorCatalogSchema";
import { vendorCatalogImagesTable } from "@/config/vendorCatalogImagesSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { categoriesTable } from "@/config/categoriesSchema";
import { subCategoriesTable } from "@/config/subCategoriesSchema";
import { and } from "drizzle-orm";


interface OnboardingTokenPayload {
    vendorId: number;
}

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_Id!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_Key!,
    },
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const onboardingToken = formData.get("onboardingToken") as string;
        const catalogTitle = formData.get("catalogTitle") as string;
        const catalogDescription = formData.get("catalogDescription") as string | null;
        const categoryId = Number(formData.get("categoryId"));
        const subCategoryId = Number(formData.get("subCategoryId"));
        const files = formData.getAll("files") as File[];

        if (
            !onboardingToken ||
            !catalogTitle ||
            !categoryId ||
            !subCategoryId ||
            files.length === 0
        ) {
            return NextResponse.json(
                { error: "Missing required catalog data." },
                { status: 400 },
            );
        }

        // Verify onboarding token
        let decoded: OnboardingTokenPayload;
        try {
            decoded = jwt.verify(
                onboardingToken,
                process.env.JWT_SECRET!,
            ) as OnboardingTokenPayload;
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired onboarding token." },
                { status: 401 },
            );
        }

        const vendorId = decoded.vendorId;

        // Fetch vendor
        const [vendor] = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (!vendor) {
            return NextResponse.json(
                { error: "Vendor not found." },
                { status: 404 },
            );
        }

        if (vendor.currentStep !== 3) {
            return NextResponse.json(
                {
                    error: `Vendor is currently on step ${vendor.currentStep}, cannot create catalog.`,
                },
                { status: 400 },
            );
        }

        /* -------------------- VALIDATE TAXONOMY -------------------- */

        const category = await db.query.categoriesTable.findFirst({
            where: eq(categoriesTable.id, categoryId),
        });

        if (!category) {
            return NextResponse.json(
                { error: "Invalid category selected." },
                { status: 400 },
            );
        }

        const subCategory = await db.query.subCategoriesTable.findFirst({
            where: and(
                eq(subCategoriesTable.id, subCategoryId),
                eq(subCategoriesTable.categoryId, categoryId),
            ),
        });

        if (!subCategory) {
            return NextResponse.json(
                { error: "Invalid subcategory for selected category." },
                { status: 400 },
            );
        }

        /* -------------------- CREATE CATALOG -------------------- */

        const [catalog] = await db
            .insert(vendorCatalogsTable)
            .values({
                vendorId,
                title: catalogTitle.trim(),
                description: catalogDescription || null,
                categoryId,
                subCategoryId,
            })
            .returning();

        /* -------------------- UPLOAD IMAGES -------------------- */

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const key = `vendors/${vendorId}/catalogs/${catalog.id}/${randomUUID()}-${file.name}`;

            await s3.send(
                new PutObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: key,
                    Body: buffer,
                    ContentType: file.type,
                }),
            );

            const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

            await db.insert(vendorCatalogImagesTable).values({
                catalogId: catalog.id,
                imageUrl,
            });
        }

        /* -------------------- ADVANCE STEP -------------------- */

        await db
            .update(vendorsTable)
            .set({
                currentStep: 4,
                status: "CATALOG_CREATED",
            })
            .where(eq(vendorsTable.id, vendorId));

        return NextResponse.json(
            {
                success: true,
                message: "Catalog created successfully.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Step 4 Error:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 },
        );
    }
}
