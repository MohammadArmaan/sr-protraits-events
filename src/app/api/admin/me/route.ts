// app/api/admin/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { adminsTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("admin_token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        let decoded: { adminId: number };
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                adminId: number;
            };
        } catch {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 },
            );
        }

        const [admin] = await db
            .select()
            .from(adminsTable)
            .where(eq(adminsTable.id, decoded.adminId));

        if (!admin) {
            return NextResponse.json(
                { error: "Admin not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, admin });
    } catch (error) {
        console.error("Admin fetch error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
