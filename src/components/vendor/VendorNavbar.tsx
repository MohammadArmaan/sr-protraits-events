"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Calendar, User, Menu, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import ThemeToggler from "../ThemeToggler";
import { useTheme } from "next-themes";

interface VendorNavbarProps {
    vendorId?: string;
}

export function VendorNavbar({ vendorId }: VendorNavbarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

        const { theme, setTheme, resolvedTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        router.push(
            `/vendor/shop?search=${encodeURIComponent(searchQuery)}`
        );
        setMobileMenuOpen(false);
    }

    const isActive = (path: string) =>
        pathname.startsWith(path);

    return (
        <>
            <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-pill shadow-lg px-6 py-3">
                    <div className="flex items-center justify-between gap-6">
                        {/* Left: Logo */}
                        <Link href="/vendor" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                                VP
                            </div>
                            <div className="hidden md:flex flex-col">
                                <span className="text-sm font-semibold">
                                    VendorPortal
                                </span>
                                {vendorId && (
                                    <span className="text-xs text-muted-foreground">
                                        ID: #{vendorId}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* Center: Search (Desktop) */}
                        <form
                            onSubmit={handleSearch}
                            className="hidden lg:flex flex-1 max-w-md"
                        >
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search services..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10 rounded-pill bg-muted/30"
                                />
                            </div>
                        </form>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex items-center gap-2">
                            <ThemeToggler />

                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "rounded-full",
                                    isActive("/vendor/calendar") &&
                                        "bg-muted"
                                )}
                                onClick={() =>
                                    router.push("/vendor/calendar")
                                }
                            >
                                <Calendar className="h-5 w-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "rounded-full",
                                    isActive("/vendor/profile") &&
                                        "bg-muted"
                                )}
                                onClick={() =>
                                    router.push(
                                        vendorId
                                            ? `/vendor/profile/${vendorId}`
                                            : "/vendor/profile"
                                    )
                                }
                            >
                                <User className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden rounded-full"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Mobile Sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="top" className="h-[45vh] rounded-b-2xl">
                    <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>

                    <div className="mt-6 space-y-6">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search services..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10 rounded-pill"
                                />
                            </div>
                        </form>

                        {/* Mobile Actions */}
                        <div className="grid grid-cols-3 gap-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    toggleTheme();
                                    setMobileMenuOpen(false);
                                }}
                                className="rounded-xl flex flex-col h-20 gap-2"
                            >
                                {theme === "light" ? (
                                    <Moon className="h-5 w-5" />
                                ) : (
                                    <Sun className="h-5 w-5" />
                                )}
                                <span className="text-xs">Theme</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="rounded-xl flex flex-col h-20 gap-2"
                                onClick={() => {
                                    router.push("/vendor/calendar");
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <Calendar className="h-5 w-5" />
                                <span className="text-xs">Calendar</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="rounded-xl flex flex-col h-20 gap-2"
                                onClick={() => {
                                    router.push(
                                        vendorId
                                            ? `/vendor/profile/${vendorId}`
                                            : "/vendor/profile"
                                    );
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <User className="h-5 w-5" />
                                <span className="text-xs">Profile</span>
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
