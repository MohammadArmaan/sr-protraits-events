// src/app/api/admin/categories/route.ts

import { NextRequest, NextResponse } from "next/server";
import { categoriesTable } from "@/config/categoriesSchema";
import { eq } from "drizzle-orm";
import slugify from "slugify";
import { db } from "@/config/db";
import { requireAdmin } from "@/lib/admin/requireAdmin";

// 
// GET → Fetch All Categories
// 
export async function GET(req: NextRequest) {
    try {

        const categories = await db.query.categoriesTable.findMany({
            orderBy: (table, { asc }) => [asc(table.name)],
        });

        return NextResponse.json(categories);
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 },
        );
    }
}

// 
// POST → Create category
// 
export async function POST(req: NextRequest) {
    try {
        await requireAdmin(req);

        const { name } = await req.json();

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 },
            );
        }

        const slug = slugify(name, { lower: true, strict: true });

        const existing = await db.query.categoriesTable.findFirst({
            where: eq(categoriesTable.slug, slug),
        });

        if (existing) {
            return NextResponse.json(
                { error: "Category already exists" },
                { status: 400 },
            );
        }

        const category = await db
            .insert(categoriesTable)
            .values({
                name,
                slug,
            })
            .returning();

        return NextResponse.json(category[0]);
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 },
        );
    }
}

//
// PUT → Update category
//
export async function PUT(req: NextRequest) {
    try {
        await requireAdmin(req);

        const body = await req.json();
        const { id, name, isActive } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Category id is required" },
                { status: 400 }
            );
        }

        const existing = await db.query.categoriesTable.findFirst({
            where: eq(categoriesTable.id, Number(id)),
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        const updateData: any = {};

        if (name) {
            const slug = slugify(name, { lower: true, strict: true });

            updateData.name = name;
            updateData.slug = slug;
        }

        if (typeof isActive === "boolean") {
            updateData.isActive = isActive;
        }

        updateData.updatedAt = new Date();

        const updated = await db
            .update(categoriesTable)
            .set(updateData)
            .where(eq(categoriesTable.id, Number(id)))
            .returning();

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}

//
// DELETE → Soft delete category
//
export async function DELETE(req: NextRequest) {
    try {
        await requireAdmin(req);

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Category id is required" },
                { status: 400 }
            );
        }

        await db
            .delete(categoriesTable)
            .where(eq(categoriesTable.id, Number(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
