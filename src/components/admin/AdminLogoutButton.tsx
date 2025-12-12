"use client";

import { Button } from "@/components/ui/button";
import { adminLogout } from "@/lib/admin/logout";
import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await adminLogout();
        router.push("/admin/login");
    }

    return (
        <Button
            variant="destructive"
            className="rounded-full px-6"
            onClick={handleLogout}
        >
            Logout
        </Button>
    );
}
