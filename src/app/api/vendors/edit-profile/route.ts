import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { vendorsTable } from "@/config/vendorsSchema";
import { vendorProfileEdits } from "@/config/vendorProfilesSchema";
import { VendorEditableFields } from "@/types/vendor-edit";
import crypto from "crypto";

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS!,
    },
});

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();

        const token = req.cookies.get("vendor_token")?.value;
        if (!token)
            return NextResponse.json(
                { error: "Missing token" },
                { status: 401 }
            );

        // Decode vendor token
        let decoded: { vendorId: number };
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                vendorId: number;
            };
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const vendorId = decoded.vendorId;

        // Fetch existing vendor
        const [vendor] = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, vendorId));

        if (!vendor)
            return NextResponse.json(
                { error: "Vendor not found" },
                { status: 404 }
            );

        // -----------------------------------------
        // Extract editable fields (safe + typed)
        // -----------------------------------------
        const incoming: VendorEditableFields = {
            fullName: form.get("fullName")?.toString(),
            businessName: form.get("businessName")?.toString(),
            occupation: form.get("occupation")?.toString(),
            phone: form.get("phone")?.toString(),
            address: form.get("address")?.toString(),
            businessDescription: form.get("businessDescription")?.toString(),
        };

        // Compute text field changes
        const changes: VendorEditableFields = {};

        (Object.keys(incoming) as (keyof VendorEditableFields)[]).forEach(
            (key) => {
                const newValue = incoming[key];
                const oldValue = vendor[key];

                if (newValue && newValue !== oldValue) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    changes[key] = newValue;
                }
            }
        );

        // -----------------------------------------
        // Handle Profile Photo Upload
        // -----------------------------------------
        let newProfilePhotoUrl: string | null = null;
        const profileFile = form.get("profilePhoto") as File | null;

        if (profileFile) {
            const buffer = Buffer.from(await profileFile.arrayBuffer());
            const fileName = `vendor-profile/${vendorId}-${Date.now()}-${
                profileFile.name
            }`;

            await s3.send(
                new PutObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: fileName,
                    Body: buffer,
                    ContentType: profileFile.type,
                })
            );

            newProfilePhotoUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        }

        // -----------------------------------------
        // Handle Business Photos Upload + Removal
        // -----------------------------------------

        // Step 1: Uploaded (new) business photos
        const businessFiles = form.getAll("businessPhotos") as File[];
        const newBusinessPhotoUrls: string[] = [];

        for (const file of businessFiles) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uniqueId = crypto.randomUUID();
            const safeName = file.name
                .replace(/\s+/g, "_")
                .replace(/[^a-zA-Z0-9_.-]/g, "");
            const fileName = `vendor-business/${vendorId}-${Date.now()}-${uniqueId}-${safeName}`;

            await s3.send(
                new PutObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: fileName,
                    Body: buffer,
                    ContentType: file.type,
                })
            );

            newBusinessPhotoUrls.push(
                `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
            );
        }

        // Step 2: Detect removed images
        const frontendBusinessPhotos = JSON.parse(
            form.get("existingBusinessPhotos")?.toString() || "[]"
        ) as string[];

        const oldBusinessPhotos = vendor.businessPhotos ?? [];

        const removedBusinessPhotos = oldBusinessPhotos.filter(
            (photo: string) => !frontendBusinessPhotos.includes(photo)
        );

        // -----------------------------------------
        // Detect Business Photo Changes
        // -----------------------------------------
        const businessPhotosChanged =
            newBusinessPhotoUrls.length > 0 || removedBusinessPhotos.length > 0;

        if (businessPhotosChanged) {
            const mergedPhotos = [
                ...frontendBusinessPhotos,
                ...newBusinessPhotoUrls,
            ];

            changes.businessPhotos = mergedPhotos;
        }

        // -----------------------------------------
        // Store Edit Request
        // -----------------------------------------
        await db.insert(vendorProfileEdits).values({
            vendorId,
            changes,

            newProfilePhotoUrl,
            oldProfilePhotoUrl: vendor.profilePhoto ?? null,

            newBusinessPhotos: newBusinessPhotoUrls,
            oldBusinessPhotos: vendor.businessPhotos ?? [],
            removedBusinessPhotos,

            status: "PENDING",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Profile edit submitted for admin approval",
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("Edit Profile Error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
