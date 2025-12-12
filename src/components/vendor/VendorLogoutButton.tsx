"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { logoutVendor } from "@/lib/sign-in/logout";

export default function VendorLogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        const ok = await logoutVendor(); 

        if (ok) {
            toast.success("Logged out");
            router.push("/vendor/sign-in");
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
