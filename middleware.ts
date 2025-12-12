import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

type UserRole = "vendor" | "admin" | "customer";

// -----------------------------
// 1️⃣ PUBLIC ROUTES (no auth)
// -----------------------------
const globalPublicRoutes = [
    "/",                // homepage
    "/about",
    "/contact",
    "/gallery",
    "/pricing",
];

// -----------------------------
// 2️⃣ AUTH ROUTES (also public)
// -----------------------------
const authRoutes = {
    vendor: [
        "/vendor/sign-in",
        "/vendor/register",
        "/vendor/forgot-password",
        "/vendor/reset-password",
    ],
    admin: [
        "/admin/sign-in",
        "/admin/forgot-password",
        "/admin/reset-password",
    ],
    customer: [
        "/customer/sign-in",
        "/customer/register",
        "/customer/forgot-password",
        "/customer/reset-password",
    ],
};

// -----------------------------
// 3️⃣ PROTECTED ROUTES PER ROLE
// -----------------------------
const protectedRoutes = {
    vendor: "/vendor",
    admin: "/admin",
    customer: "/customer",
};

// -----------------------------
// Helper: check if path starts with any allowed route
// -----------------------------
function matches(pathname: string, routes: string[]) {
    return routes.some((route) => pathname.startsWith(route));
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // -----------------------------
    // Allow all global public routes
    // -----------------------------
    if (matches(pathname, globalPublicRoutes)) {
        return NextResponse.next();
    }

    // -----------------------------
    // ROLE detection based on URL
    // -----------------------------
    let role: UserRole | null = null;
    if (pathname.startsWith("/vendor")) role = "vendor";
    if (pathname.startsWith("/admin")) role = "admin";
    if (pathname.startsWith("/customer")) role = "customer";

    // If route doesn't belong to any role, allow
    if (!role) return NextResponse.next();

    // -----------------------------
    // Allow access to auth routes (public)
    // -----------------------------
    if (matches(pathname, authRoutes[role])) {
        return NextResponse.next();
    }

    // -----------------------------
    // Validate Token
    // -----------------------------
    const tokenName =
        role === "vendor"
            ? "vendor_token"
            : role === "admin"
            ? "admin_token"
            : "customer_token";

    const token = req.cookies.get(tokenName)?.value;

    if (!token) {
        return NextResponse.redirect(new URL(`${protectedRoutes[role]}/sign-in`, req.url));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            role: UserRole;
        };

        // Role mismatch? BLOCK
        if (decoded.role !== role) {
            const res = NextResponse.redirect(
                new URL(`${protectedRoutes[role]}/sign-in`, req.url)
            );
            res.cookies.delete(tokenName);
            return res;
        }
    } catch {
        const res = NextResponse.redirect(
            new URL(`${protectedRoutes[role]}/sign-in`, req.url)
        );
        res.cookies.delete(tokenName);
        return res;
    }

    // Token valid → allow
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/vendor/:path*",
        "/admin/:path*",
        "/customer/:path*",
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
