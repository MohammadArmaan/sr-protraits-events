// components/admin/AdminAuthWrapper.tsx
"use client";

import Loader from "@/components/Loader";
import { useAdmin } from "@/hooks/queries/admin/useAdmin";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminAuthWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: admin, isLoading } = useAdmin();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !admin) {
            router.replace("/admin/login");
        }
    }, [admin, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    if (!admin) return null;

    return <>{children}</>;
}
