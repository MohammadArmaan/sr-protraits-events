"use client";

import Loader from "@/components/Loader";
import { useVendor } from "@/hooks/queries/useVendor";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VendorAuthWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: vendor, isLoading } = useVendor();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !vendor) {
            router.replace("/vendor/sign-in");
        }
    }, [isLoading, vendor, router]);

    if (isLoading || !vendor) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-28 pb-12 px-4 md:px-10 max-w-7xl mx-auto w-full">
            {children}
        </main>
    );
}
