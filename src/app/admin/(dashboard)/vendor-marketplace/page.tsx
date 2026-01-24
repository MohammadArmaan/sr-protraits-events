"use client";

import { useMemo } from "react";
import { MoreVertical, Eye, Pencil, Trash2, Plus, Star } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Pagination } from "@/components/ui/pagination";
import { VendorProduct } from "@/types/vendor-product";
import { MarketplacePagination } from "./_components/MarketplacePagination";
import { MarketplaceTableSkeleton } from "@/components/skeleton/MarketplaceTableSkeleton";
import Zoom from "react-medium-image-zoom";

const PAGE_SIZE = 8;

export default function AdminVendorMarketplacePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = Number(searchParams.get("page") ?? 1);
    const status = searchParams.get("status"); // active | inactive
    const featured = searchParams.get("featured"); // true | false
    const sort = searchParams.get("sort") ?? "createdAt";

    const { data, isLoading } = useAdminVendorProducts();
    const deleteMutation = useDeleteVendorProduct();

    const products = data?.products ?? [];

    /* ---------------- FILTER + SORT ---------------- */
    const filtered = useMemo(() => {
        let list = [...products];

        if (status === "active") list = list.filter((p) => p.isActive);
        if (status === "inactive") list = list.filter((p) => !p.isActive);
        if (featured === "true") list = list.filter((p) => p.isFeatured);

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
    }, [products, status, featured, sort]);

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

    const handleDelete = async (product: VendorProduct) => {
        await deleteMutation.mutateAsync(product.id);
        toast.success("Listing deleted");
    };

    /* ---------------- UI ---------------- */
    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Vendor Marketplace"
                description="Manage vendor listings and marketplace visibility"
            >
                <Button
                    onClick={() => router.push("/admin/vendor-marketplace/new")}
                    className="bg-gradient-primary text-primary-foreground"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Listing
                </Button>
            </PageHeader>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
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
                                <TableHead>Status</TableHead>
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
                                        <div className="flex gap-3">
                                            <Zoom>
                                                <img
                                                    src={
                                                        product.images[
                                                            product
                                                                .featuredImageIndex
                                                        ]
                                                    }
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
                                            ₹{product.basePriceSingleDay} / day
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Advance:{" "}
                                            {product.advanceType === "FIXED"
                                                ? `₹${product.advanceValue}`
                                                : `${product.advanceValue}%`}
                                        </p>
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
                                        colSpan={5}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        No marketplace listings found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
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
