"use client";

import { Button } from "@/components/ui/button";
import { adminLogout } from "@/lib/admin/logout";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await adminLogout();
        router.push("/admin/login");
    }

    return (
        <Button
            size="icon"
            variant="destructive"
            onClick={handleLogout}
        >
            <LogOut className="h-4 w-4 mr-2" />
        </Button>
    );
}
