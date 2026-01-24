"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminProfileDropdown } from "./AdminProfileDropdown";

export function AdminHeader() {
    return (
        <header className="flex h-16 items-center justify-between  px-4 md:px-6 bg-card/80 backdrop-blur-xl border border-border shadow-md">
            <div className="flex justify-between w-full">

            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </div>

            <AdminProfileDropdown />
            </div>
        </header>
    );
}
