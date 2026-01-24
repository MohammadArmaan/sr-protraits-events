import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
    title: {
        default: "Admin Dashboard | SR Portraits & Events",
        template: "%s | Admin | SR Portraits & Events",
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminAuthWrapper>
            <SidebarProvider>
                <AdminSidebar />

                <div className="w-full">
                    <AdminHeader />
                    <main className="p-4 md:p-6">{children}</main>
                </div>
            </SidebarProvider>
        </AdminAuthWrapper>
    );
}
