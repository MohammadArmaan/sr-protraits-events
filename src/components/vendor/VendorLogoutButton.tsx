"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { logoutVendor } from "@/lib/sign-in/logout";
import { useQueryClient } from "@tanstack/react-query";

export default function VendorLogoutButton() {
    const router = useRouter();
    const queryClient = useQueryClient();

    async function handleLogout() {
        const ok = await logoutVendor();

        if (ok) {
            // 🔥 CLEAR ALL CACHED SERVER STATE
            queryClient.clear();

            toast.success("Logged out");

            // Hard navigation to reset app state
            window.location.replace("/vendor/sign-in");
        } else {
            toast.error("Failed to logout. Try again.");
        }
    }

    return (
        <Button
            variant="destructive"
            className="rounded-full w-full flex items-center gap-2 px-6 py-2"
            onClick={handleLogout}
        >
            <LogOut className="w-4 h-4" />
            Logout
        </Button>
    );
}

