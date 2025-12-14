import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

type UserRole = "vendor" | "admin" | "customer";

/* -----------------------------
   1️⃣ GLOBAL PUBLIC ROUTES
-------------------------------- */
const globalPublicRoutes = [
    "/", // ONLY homepage
    "/about",
    "/contact",
    "/gallery",
    "/pricing",
];

/* -----------------------------
   2️⃣ AUTH ROUTES (PUBLIC)
-------------------------------- */
const authRoutes: Record<UserRole, string[]> = {
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

/* -----------------------------
   3️⃣ PROTECTED ROOT PATHS
-------------------------------- */
const protectedRoots: Record<UserRole, string> = {
    vendor: "/vendor",
    admin: "/admin",
    customer: "/customer",
};

/* -----------------------------
   SAFE ROUTE MATCHER
-------------------------------- */
function matches(pathname: string, routes: string[]) {
    return routes.some((route) =>
        route === "/" ? pathname === "/" : pathname.startsWith(route)
    );
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    /* -----------------------------
       Allow global public routes
    -------------------------------- */
    if (matches(pathname, globalPublicRoutes)) {
        return NextResponse.next();
    }

    /* -----------------------------
       Detect role from URL
    -------------------------------- */
    let role: UserRole | null = null;

    if (pathname.startsWith("/vendor")) role = "vendor";
    else if (pathname.startsWith("/admin")) role = "admin";
    else if (pathname.startsWith("/customer")) role = "customer";

    // Not a role-based route → allow
    if (!role) return NextResponse.next();

    /* -----------------------------
       Resolve token name
    -------------------------------- */
    const tokenName =
        role === "vendor"
            ? "vendor_token"
            : role === "admin"
            ? "admin_token"
            : "customer_token";

    const token = req.cookies.get(tokenName)?.value;

    /* -----------------------------
       AUTH ROUTES LOGIC
    -------------------------------- */
    if (matches(pathname, authRoutes[role])) {
        // Logged-in user trying to access auth page → redirect to dashboard
        if (token) {
            return NextResponse.redirect(
                new URL(protectedRoots[role], req.url)
            );
        }
        return NextResponse.next();
    }

    /* -----------------------------
       PROTECTED ROUTES
    -------------------------------- */
    if (!token) {
        return NextResponse.redirect(
            new URL(`${protectedRoots[role]}/sign-in`, req.url)
        );
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            role: UserRole;
        };

        // Role mismatch → block & clear cookie
        if (decoded.role !== role) {
            const res = NextResponse.redirect(
                new URL(`${protectedRoots[role]}/sign-in`, req.url)
            );
            res.cookies.delete(tokenName);
            return res;
        }
    } catch {
        const res = NextResponse.redirect(
            new URL(`${protectedRoots[role]}/sign-in`, req.url)
        );
        res.cookies.delete(tokenName);
        return res;
    }

    /* -----------------------------
       Prevent BACK navigation
       on protected pages
    -------------------------------- */
    const res = NextResponse.next();
    res.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    return res;
}

/* -----------------------------
   MIDDLEWARE CONFIG
-------------------------------- */
export const config = {
    matcher: [
        "/vendor/:path*",
        "/admin/:path*",
        "/customer/:path*",
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
