import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Clear the vendor JWT cookie
        const response = NextResponse.json(
            { success: true, message: "Logged out successfully" },
            { status: 200 }
        );

        response.cookies.set("vendor_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(0), // delete immediately
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Logout Error:", error);

        return NextResponse.json(
            { error: "Failed to logout" },
            { status: 500 }
        );
    }
}
