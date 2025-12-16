// src/lib/vendor/getVendorFromRequest.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/config/db";
import { vendorsTable } from "@/config/vendorsSchema";
import { eq } from "drizzle-orm";

export async function getVendorFromRequest(req: NextRequest) {
    const token = req.cookies.get("vendor_token")?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as { vendorId: number };

        const vendor = await db.query.vendorsTable.findFirst({
            where: eq(vendorsTable.id, decoded.vendorId),
        });

        return vendor ?? null;
    } catch {
        return null;
    }
}
