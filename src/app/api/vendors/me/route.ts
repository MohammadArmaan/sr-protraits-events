import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("vendor_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let decoded: { vendorId: number };
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as { vendorId: number };
        } catch {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const [vendor] = await db
            .select()
            .from(vendorsTable)
            .where(eq(vendorsTable.id, decoded.vendorId));

        if (!vendor) {
            return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, vendor });
    } catch (error) {
        console.error("Vendor fetch error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
