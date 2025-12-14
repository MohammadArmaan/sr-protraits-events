"use client";

import Loader from "@/components/Loader";
import { useVendor } from "@/hooks/queries/useVendor";

export default function VendorAuthWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading } = useVendor();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
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
