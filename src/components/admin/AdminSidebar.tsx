"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    ChevronDown,
    Building2,
    User,
    IndianRupee,
} from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function AdminSidebar() {
    const pathname = usePathname();

    /* ---------------- ACTIVE HELPERS ---------------- */
    const isExactActive = (href: string) => pathname === href;

    const isSectionActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Sidebar className="text-foreground border-r bg-card/80 backdrop-blur-xl border-border shadow-md">
            {/* ---------------- HEADER ---------------- */}
            <SidebarHeader className="px-6 h-16 py-3 text-lg font-semibold border-b flex items-center justify-center">
                SR Admin Panel
            </SidebarHeader>

            {/* ---------------- CONTENT ---------------- */}
            <SidebarContent className="p-3">
                <SidebarMenu>
                    {/* ================= DASHBOARD ================= */}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className={clsx(
                                isExactActive("/admin") &&
                                    "bg-gradient-primary text-primary-foreground",
                            )}
                        >
                            <Link href="/admin/dashboard">
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* ================= VENDORS ================= */}
                    <Collapsible
                        asChild
                        defaultOpen={pathname.startsWith("/admin/vendor")}
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton>
                                    <Building2 className="h-4 w-4" />
                                    <span>Vendors</span>
                                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={clsx(
                                                isSectionActive(
                                                    "/admin/vendor-registration",
                                                ) &&
                                                    "bg-gradient-primary text-primary-foreground",
                                            )}
                                        >
                                            <Link href="/admin/vendor-registration">
                                                Vendor Registrations
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={clsx(
                                                isSectionActive(
                                                    "/admin/profile-edits",
                                                ) &&
                                                    "bg-gradient-primary text-primary-foreground",
                                            )}
                                        >
                                            <Link href="/admin/profile-edits">
                                                Profile Edit Requests
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={clsx(
                                                isSectionActive(
                                                    "/admin/vendor-bank-details",
                                                ) &&
                                                    "bg-gradient-primary text-primary-foreground",
                                            )}
                                        >
                                            <Link href="/admin/vendor-bank-details">
                                                Bank Details Requests
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={clsx(
                                                isSectionActive(
                                                    "/admin/vendor-marketplace",
                                                ) &&
                                                    "bg-gradient-primary text-primary-foreground",
                                            )}
                                        >
                                            <Link href="/admin/vendor-marketplace">
                                                Vendor Marketplace
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={clsx(
                                                isSectionActive(
                                                    "/admin/vendor-coupons",
                                                ) &&
                                                    "bg-gradient-primary text-primary-foreground",
                                            )}
                                        >
                                            <Link href="/admin/vendor-coupons">
                                                Vendor Coupons
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={clsx(
                                                isSectionActive(
                                                    "/admin/vendor-banners",
                                                ) &&
                                                    "bg-gradient-primary text-primary-foreground",
                                            )}
                                        >
                                            <Link href="/admin/vendor-banners">
                                                Vendor Banners
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={clsx(
                                                isSectionActive(
                                                    "/admin/vendor-categories",
                                                ) &&
                                                    "bg-gradient-primary text-primary-foreground",
                                            )}
                                        >
                                            <Link href="/admin/vendor-categories">
                                                Vendor Categories
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>

                    {/* ================= CUSTOMERS ================= */}
                    {/* <Collapsible
                        asChild
                        defaultOpen={pathname.startsWith("/admin/customers")}
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton>
                                    <User className="h-4 w-4" />
                                    <span>Customers</span>
                                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={clsx(
                                                isSectionActive(
                                                    "/admin/customers",
                                                ) &&
                                                    "bg-gradient-primary text-primary-foreground",
                                            )}
                                        >
                                            <Link href="/admin/customers">
                                                All Customers
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={clsx(
                                                isSectionActive(
                                                    "/admin/customer-bookings",
                                                ) &&
                                                    "bg-gradient-primary text-primary-foreground",
                                            )}
                                        >
                                            <Link href="/admin/customer-bookings">
                                                Customer Bookings
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible> */}

                    {/* ================= REVENUE ================= */}
                    {/* <Collapsible
                        asChild
                        defaultOpen={pathname.startsWith("/admin/revenue")}
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton>
                                    <IndianRupee className="h-4 w-4" />
                                    <span>Revenue</span>
                                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={clsx(
                                                isSectionActive(
                                                    "/admin/revenue",
                                                ) &&
                                                    "bg-gradient-primary text-primary-foreground",
                                            )}
                                        >
                                            <Link href="/admin/revenue">
                                                Platform Revenue
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={clsx(
                                                isSectionActive(
                                                    "/admin/settlements",
                                                ) &&
                                                    "bg-gradient-primary text-primary-foreground",
                                            )}
                                        >
                                            <Link href="/admin/settlements">
                                                Vendor Settlements
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible> */}
                </SidebarMenu>
            </SidebarContent>

            {/* ---------------- FOOTER ---------------- */}
            <SidebarFooter className="p-4 text-xs text-muted-foreground border-t">
                © SR Portraits & Events
            </SidebarFooter>
        </Sidebar>
    );
}
