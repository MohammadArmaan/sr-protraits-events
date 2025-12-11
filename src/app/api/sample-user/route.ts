import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
    try {
        const users = await db.select().from(usersTable);
        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching frame:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}
