/**
 * Admin – Update / Replace Banner
 */
import { NextRequest, NextResponse } from "next/server";
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { db } from "@/config/db";
import { vendorBannersTable } from "@/config/vendorBannersSchema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

interface AdminTokenPayload {
    adminId: number;
    role: "admin" | "superadmin";
}

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS!,
    },
});

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const bannerId = Number(id);

        if (!Number.isInteger(bannerId)) {
            return NextResponse.json(
                { error: "Invalid banner id" },
                { status: 400 }
            );
        }

        /* ------------------ AUTH ------------------ */
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

        /* ------------------ FETCH BANNER ------------------ */
        const [banner] = await db
            .select()
            .from(vendorBannersTable)
            .where(eq(vendorBannersTable.id, bannerId));

        if (!banner) {
            return NextResponse.json(
                { error: "Banner not found" },
                { status: 404 }
            );
        }

        /* ------------------ FORM DATA ------------------ */
        const formData = await req.formData();
        const file = formData.get("image") as File | null;

        const title = formData.get("title") as string | null;
        const subtitle = formData.get("subtitle") as string | null;
        const ctaText = formData.get("ctaText") as string | null;
        const ctaLink = formData.get("ctaLink") as string | null;
        const order = Number(formData.get("order") ?? banner.order);

        let imageUrl = banner.imageUrl;

        /* ------------------ REPLACE IMAGE ------------------ */
        if (file) {
            // delete old image
            const oldKey = banner.imageUrl.split(".com/")[1];
            await s3.send(
                new DeleteObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: oldKey,
                })
            );

            // upload new image
            const buffer = Buffer.from(await file.arrayBuffer());
            const newKey = `banner-images/${Date.now()}-${file.name}`;

            await s3.send(
                new PutObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: newKey,
                    Body: buffer,
                    ContentType: file.type,
                })
            );

            imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;
        }

        /* ------------------ DB UPDATE ------------------ */
        const updateData: Partial<{
            imageUrl: string;
            title: string | null;
            subtitle: string | null;
            ctaText: string | null;
            ctaLink: string | null;
            order: number;
            updatedAt: Date;
        }> = {
            updatedAt: new Date(),
        };

        // only update fields if they exist in formData
        if (imageUrl !== banner.imageUrl) updateData.imageUrl = imageUrl;

        if (formData.has("title")) {
            updateData.title = title;
        }

        if (formData.has("subtitle")) {
            updateData.subtitle = subtitle;
        }

        if (formData.has("ctaText")) {
            updateData.ctaText = ctaText;
        }

        if (formData.has("ctaLink")) {
            updateData.ctaLink = ctaLink;
        }

        if (formData.has("order")) {
            updateData.order = order;
        }
        await db
            .update(vendorBannersTable)
            .set(updateData)
            .where(eq(vendorBannersTable.id, bannerId));

        return NextResponse.json(
            { success: true, message: "Banner updated successfully", updatedData: updateData },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update Banner Error:", error);
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
        const bannerId = Number(id);

        if (!Number.isInteger(bannerId)) {
            return NextResponse.json(
                { error: "Invalid banner id" },
                { status: 400 }
            );
        }

        /* ------------------ AUTH ------------------ */
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

        /* ------------------ FETCH BANNER ------------------ */
        const [banner] = await db
            .select()
            .from(vendorBannersTable)
            .where(eq(vendorBannersTable.id, bannerId));

        if (!banner) {
            return NextResponse.json(
                { error: "Banner not found" },
                { status: 404 }
            );
        }

        /* ------------------ DELETE S3 IMAGE ------------------ */
        const key = banner.imageUrl.split(".com/")[1];

        await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: key,
            })
        );

        /* ------------------ DELETE DB ROW ------------------ */
        await db
            .delete(vendorBannersTable)
            .where(eq(vendorBannersTable.id, bannerId));

        return NextResponse.json(
            { success: true, message: "Banner deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete Banner Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
