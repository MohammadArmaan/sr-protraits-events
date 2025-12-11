// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface AuthTokenPayload {
    vendorId?: number;
    userId?: number;
    role: "vendor" | "admin" | "user";
    step?: number; // onboarding step (optional)
    iat: number;
    exp: number;
}

export function middleware(req: NextRequest) {
    const token = req.cookies.get("auth_token")?.value;

    // Public routes (no auth required)
    const publicRoutes = ["/login", "/register", "/"];

    if (publicRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // If no token → redirect to login
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    let decoded: AuthTokenPayload;
    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as AuthTokenPayload;
    } catch {
        // Token invalid → force logout
        const res = NextResponse.redirect(new URL("/login", req.url));
        res.cookies.delete("auth_token");
        return res;
    }

    const role = decoded.role;

    // Route-based protection
    const path = req.nextUrl.pathname;

    // Vendor-only routes
    if (path.startsWith("/vendor") && role !== "vendor") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Admin-only routes
    if (path.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Customer-only routes
    if (path.startsWith("/user") && role !== "user") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/vendor/:path*", "/admin/:path*", "/user/:path*"],
};
