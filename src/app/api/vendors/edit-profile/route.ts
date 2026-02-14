import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorProfileEdits } from "@/config/vendorProfilesSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { categoriesTable } from "@/config/categoriesSchema";
import { subCategoriesTable } from "@/config/subCategoriesSchema";
import { and } from "drizzle-orm";


/* -------------------- REQUIRED FOR FILE UPLOAD -------------------- */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*                               S3                                   */
/* ------------------------------------------------------------------ */

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_Id!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_Key!,
    },
});

/* ------------------------------------------------------------------ */
/*                               POST                                 */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
    try {
        console.log("🔥 PROFILE EDIT API HIT");

        const form = await req.formData();

        console.log("FORM KEYS:", [...form.keys()]);

        /* ----------------------------- AUTH ----------------------------- */

        const token = req.cookies.get("vendor_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            vendorId: number;
        };

        const vendorId = decoded.vendorId;


        /* ------------------------ FETCH VENDOR --------------------------- */

        const [vendor] = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (!vendor) {
            return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
        }

        /* --------------------- PROFILE FIELD CHANGES --------------------- */

        const incoming = {
            fullName: form.get("fullName")?.toString(),
            businessName: form.get("businessName")?.toString(),
            occupation: form.get("occupation")?.toString(),
            phone: form.get("phone")?.toString(),
            address: form.get("address")?.toString(),
            businessDescription: form.get("businessDescription")?.toString(),
            yearsOfExperience: form.get("yearsOfExperience")
                ? Number(form.get("yearsOfExperience"))
                : undefined,
            successfulEventsCompleted: form.get("successfulEventsCompleted")
                ? Number(form.get("successfulEventsCompleted"))
                : undefined,
            gstNumber: form.get("gstNumber")?.toString(),
        };

        const profileChanges: Record<string, any> = {};

        Object.entries(incoming).forEach(([key, value]) => {
            if (value !== undefined && value !== (vendor as any)[key]) {
                profileChanges[key] = value;
            }
        });

        /* -------------------- PROFILE PHOTO UPLOAD ----------------------- */

        let newProfilePhotoUrl: string | null = null;

        const profileFile = form.get("profilePhoto");
        if (profileFile && typeof profileFile === "object") {
            const file = profileFile as File;
            const buffer = Buffer.from(await file.arrayBuffer());

            const key = `vendors/${vendorId}/profile/${crypto.randomUUID()}-${file.name}`;

            console.log("Uploading profile photo:", file.name);

            await s3.send(
                new PutObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: key,
                    Body: buffer,
                    ContentType: file.type,
                }),
            );

            newProfilePhotoUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        }

/* ------------------------- CATALOG CHANGES ------------------------ */

const rawCatalogChanges = form.get("catalogChanges")?.toString();

const catalogEdits: {
    catalogId?: number;
    title?: string;
    categoryId?: number;
    subCategoryId?: number;
    removedImages?: string[];
}[] = rawCatalogChanges ? JSON.parse(rawCatalogChanges) : [];
const uploadedImagesByCatalog = new Map<number | string, string[]>();

/* ------------------ UPLOAD NEW CATALOG IMAGES -------------------- */

for (let i = 0; i < catalogEdits.length; i++) {
    const edit = catalogEdits[i];

    let files: File[] = [];
    let catalogKey: string;

    if (edit.catalogId) {
        // Existing catalog
        catalogKey = `catalog_${edit.catalogId}`;
        files = form.getAll(`catalog_${edit.catalogId}_images`) as File[];
    } else {
        // New catalog
        catalogKey = `catalog_new_${i}`;
        files = form.getAll(`catalog_new_${i}_images`) as File[];
    }

    for (const file of files) {
        if (!(file instanceof File)) continue;

        const buffer = Buffer.from(await file.arrayBuffer());

        const s3Key = edit.catalogId
            ? `vendors/${vendorId}/catalogs/${edit.catalogId}/${crypto.randomUUID()}-${file.name}`
            : `vendors/${vendorId}/catalogs/pending/${crypto.randomUUID()}-${file.name}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: s3Key,
                Body: buffer,
                ContentType: file.type,
            }),
        );

        const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

        const existing = uploadedImagesByCatalog.get(catalogKey) ?? [];
        uploadedImagesByCatalog.set(catalogKey, [...existing, imageUrl]);
    }
}


/* ------------------ BUILD ACTION-BASED CHANGES -------------------- */

const catalogActions = catalogEdits.map((edit, index) => {
    const catalogKey = edit.catalogId ? `catalog_${edit.catalogId}` : `catalog_new_${index}`;
    const uploadedImages = uploadedImagesByCatalog.get(catalogKey);

    return {
        catalogId: edit.catalogId,
        action: edit.catalogId ? ("UPDATE" as const) : ("ADD" as const),
        payload: {
            title: edit.title,
            categoryId: edit.categoryId,
            subCategoryId: edit.subCategoryId,
            addedImages: uploadedImages?.length ? uploadedImages : undefined,
        },
    };
});


        /* ---------------------- STORE EDIT REQUEST ------------------------ */

        await db.insert(vendorProfileEdits).values({
            vendorId,
            profileChanges:
                Object.keys(profileChanges).length > 0 ? profileChanges : undefined,
            catalogChanges: catalogActions.length ? catalogActions : undefined,
            newProfilePhotoUrl,
            oldProfilePhotoUrl: vendor.profilePhoto ?? null,
            status: "PENDING",
        });

        return NextResponse.json({
            success: true,
            message: "Profile update submitted for admin approval",
        });
    } catch (err) {
        console.error("Vendor profile edit error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
