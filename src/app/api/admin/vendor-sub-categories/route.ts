import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { subCategoriesTable } from "@/config/subCategoriesSchema";
import { categoriesTable } from "@/config/categoriesSchema";
import { eq, and, asc } from "drizzle-orm";
import slugify from "slugify";
import { requireAdmin } from "@/lib/admin/requireAdmin";

//
// GET → List subcategories (optionally filtered by categoryId)
//
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const categoryId = searchParams.get("categoryId");

        const whereClause = categoryId
            ? eq(subCategoriesTable.categoryId, Number(categoryId))
            : undefined;

        const subCategories = await db.query.subCategoriesTable.findMany({
            where: whereClause,
            orderBy: [asc(subCategoriesTable.name)],
        });

        return NextResponse.json(subCategories);
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 },
        );
    }
}

//
// POST → Create subcategory
//
export async function POST(req: NextRequest) {
    try {
        await requireAdmin(req);

        const body = await req.json();
        const { name, categoryId } = body;

        if (!name || !categoryId) {
            return NextResponse.json(
                { error: "Name and categoryId are required" },
                { status: 400 },
            );
        }

        // Validate category exists
        const category = await db.query.categoriesTable.findFirst({
            where: eq(categoriesTable.id, Number(categoryId)),
        });

        if (!category) {
            return NextResponse.json(
                { error: "Invalid category" },
                { status: 400 },
            );
        }

        const slug = slugify(name, { lower: true, strict: true });

        // Ensure unique per category
        const existing = await db.query.subCategoriesTable.findFirst({
            where: and(
                eq(subCategoriesTable.categoryId, Number(categoryId)),
                eq(subCategoriesTable.slug, slug),
            ),
        });

        if (existing) {
            return NextResponse.json(
                { error: "Subcategory already exists in this category" },
                { status: 400 },
            );
        }

        const subCategory = await db
            .insert(subCategoriesTable)
            .values({
                name,
                slug,
                categoryId: Number(categoryId),
            })
            .returning();

        return NextResponse.json(subCategory[0]);
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 },
        );
    }
}

//
// PUT → Update subcategory
//
export async function PUT(req: NextRequest) {
    try {
        await requireAdmin(req);

        const body = await req.json();
        const { id, name, categoryId, isActive } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Subcategory id is required" },
                { status: 400 },
            );
        }

        let updateData: any = {};

        if (name) {
            const slug = slugify(name, { lower: true, strict: true });
            updateData.name = name;
            updateData.slug = slug;
        }

        if (categoryId) {
            updateData.categoryId = Number(categoryId);
        }

        if (typeof isActive === "boolean") {
            updateData.isActive = isActive;
        }

        updateData.updatedAt = new Date();

        const updated = await db
            .update(subCategoriesTable)
            .set(updateData)
            .where(eq(subCategoriesTable.id, Number(id)))
            .returning();

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 },
        );
    }
}

//
// DELETE → Soft delete subcategory
//
export async function DELETE(req: NextRequest) {
    try {
        await requireAdmin(req);

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Subcategory id is required" },
                { status: 400 },
            );
        }

        await db
            .delete(subCategoriesTable)
            .where(eq(subCategoriesTable.id, Number(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 },
        );
    }
}
