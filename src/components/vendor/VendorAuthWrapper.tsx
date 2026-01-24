"use client";

import Loader from "@/components/Loader";
import { useVendor } from "@/hooks/queries/useVendor";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const AUTH_ROUTES = [
    "/vendor/sign-in",
    "/vendor/register",
    "/vendor/forgot-password",
    "/vendor/password-reset",
];

export default function VendorAuthWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: vendor, isLoading } = useVendor();
    const router = useRouter();
    const pathname = usePathname();

    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    useEffect(() => {
        // Only redirect if:
        // - auth check is done
        // - vendor is NOT logged in
        // - current route is NOT an auth route
        if (!isLoading && !vendor && !isAuthRoute) {
            router.replace("/vendor/sign-in");
        }
    }, [vendor, isLoading, isAuthRoute, router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    // ✅ Allow auth pages without redirect
    if (!vendor && isAuthRoute) {
        return <>{children}</>;
    }

    // ✅ Allow protected pages when logged in
    if (vendor) {
        return (
            <main className="min-h-screen pt-28 pb-12 px-4 md:px-10 max-w-7xl mx-auto w-full">
                {children}
            </main>
        );
    }

    return null;
}
