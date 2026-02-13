"use client";

import { useMemo, useState } from "react";
import {
    MoreVertical,
    Eye,
    Pencil,
    Trash2,
    Plus,
    Star,
    Zap,
    Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Zoom from "react-medium-image-zoom";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAdminVendorProducts } from "@/hooks/queries/admin/vendor-marketplace/useAdminVendorProducts";
import { useDeleteVendorProduct } from "@/hooks/queries/admin/vendor-marketplace/useDeleteVendorProduct";
import { VendorProduct } from "@/types/vendor-product";
import { MarketplaceTableSkeleton } from "@/components/skeleton/MarketplaceTableSkeleton";
import { MarketplacePagination } from "./MarketplacePagination";
import { AdminVendorProduct } from "@/types/admin/vendor-products";

const PAGE_SIZE = 8;

export default function AdminVendorMarketplace() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = Number(searchParams.get("page") ?? 1);
    const status = searchParams.get("status"); // active | inactive
    const featured = searchParams.get("featured"); // true
    const priority = searchParams.get("priority"); // true
    const session = searchParams.get("session"); // true
    const sort = searchParams.get("sort") ?? "createdAt";

    const [search, setSearch] = useState("");

    const { data, isLoading } = useAdminVendorProducts();
    const deleteMutation = useDeleteVendorProduct();

    const products = data?.products ?? [];

    /* ---------------- FILTER + SORT ---------------- */
    const filtered = useMemo(() => {
        let list = [...products];

        if (status === "active") list = list.filter((p) => p.isActive);
        if (status === "inactive") list = list.filter((p) => !p.isActive);
        if (featured === "true") list = list.filter((p) => p.isFeatured);
        if (priority === "true") list = list.filter((p) => p.isPriority);
        if (session === "true") list = list.filter((p) => p.isSessionBased);

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.businessName.toLowerCase().includes(q),
            );
        }

        if (sort === "price") {
            list.sort((a, b) => a.basePriceSingleDay - b.basePriceSingleDay);
        } else {
            list.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            );
        }

        return list;
    }, [products, status, featured, priority, session, sort, search]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    /* ---------------- HELPERS ---------------- */
    const setParam = (key: string, value?: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    const handleDelete = async (product: AdminVendorProduct) => {
        await deleteMutation.mutateAsync(product.id);
        toast.success("Listing deleted");
    };

    const getFeaturedImage = (product: AdminVendorProduct) => {
        if (product.featuredImageUrl) {
            return (
                product.featuredImageUrl
            );
        }
        return "/placeholder.jpg";
    };

    /* ---------------- UI ---------------- */
    return (
        <div className="animate-fade-in space-y-4">
            <PageHeader
                title="Vendor Marketplace"
                description="Manage vendor listings and marketplace visibility"
            >
                <Button
                    onClick={() =>
                        router.push("/admin/vendor-marketplace/new")
                    }
                    className="bg-gradient-primary text-primary-foreground"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Listing
                </Button>
            </PageHeader>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search listing or business..."
                        className="pl-9 w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Button
                    variant={status === "active" ? "default" : "outline"}
                    onClick={() => setParam("status", "active")}
                >
                    Active
                </Button>

                <Button
                    variant={featured === "true" ? "default" : "outline"}
                    onClick={() => setParam("featured", "true")}
                >
                    Featured
                </Button>

                <Button
                    variant={priority === "true" ? "default" : "outline"}
                    onClick={() => setParam("priority", "true")}
                >
                    Priority
                </Button>

                <Button
                    variant={session === "true" ? "default" : "outline"}
                    onClick={() => setParam("session", "true")}
                >
                    Session Based
                </Button>

                <Button
                    variant={sort === "price" ? "default" : "outline"}
                    onClick={() => setParam("sort", "price")}
                >
                    Sort by Price
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => router.push("/admin/vendor-marketplace")}
                >
                    Reset
                </Button>
            </div>

            {/* Table */}
            {isLoading ? (
                <MarketplaceTableSkeleton />
            ) : (
                <div className="bg-card rounded-lg shadow-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Listing</TableHead>
                                <TableHead>Pricing</TableHead>
                                <TableHead>Session</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Featured</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginated.map((product) => (
                                <TableRow
                                    key={product.id}
                                    className="hover:bg-muted/30"
                                >
                                    <TableCell>
                                        <div className="flex gap-3 items-center">
                                            <Zoom>
                                                <img
                                                    src={getFeaturedImage(
                                                        product,
                                                    )}
                                                    className="h-12 w-12 rounded-lg object-cover border"
                                                />
                                            </Zoom>
                                            <div>
                                                <p className="font-medium">
                                                    {product.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {product.businessName}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <p className="font-medium">
                                            ₹{product.basePriceSingleDay}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Advance{" "}
                                            {product.advanceType === "FIXED"
                                                ? `₹${product.advanceValue}`
                                                : `${product.advanceValue}%`}
                                        </p>
                                    </TableCell>

                                    <TableCell>
                                        {product.isSessionBased ? (
                                            <Badge variant="secondary">
                                                Session
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">Day</Badge>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant={
                                                product.isActive
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {product.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        {product.isPriority ? (
                                            <Zap className="h-4 w-4 text-orange-500" />
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {product.isFeatured ? (
                                            <Star className="h-4 w-4 text-accent fill-current" />
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/vendor-marketplace/${product.id}`,
                                                        )
                                                    }
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/vendor-marketplace/${product.id}/edit`,
                                                        )
                                                    }
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDelete(product)
                                                    }
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {paginated.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        No marketplace listings found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <MarketplacePagination
                            page={page}
                            totalPages={totalPages}
                            onPageChange={(p) => router.push(`?page=${p}`)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
