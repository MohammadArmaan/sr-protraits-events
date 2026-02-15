"use client";

import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Edit,
    Star,
    IndianRupee,
    Zap,
    Calendar,
    Package,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import Zoom from "react-medium-image-zoom";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { VendorMarketplaceDetailsSkeleton } from "@/components/skeleton/VendorMarketplaceDetailsSkeleton";

import { useAdminVendorProduct } from "@/hooks/queries/admin/vendor-marketplace/useAdminVendorProduct";
import { VendorProductImagesByCatalog } from "@/types/admin/vendor-products";

export default function VendorMarketplaceDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const productId = Number(id);
    const { data, isLoading } = useAdminVendorProduct(productId);

    if (isLoading) return <VendorMarketplaceDetailsSkeleton />;

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[400px] px-4">
                <div className="text-center space-y-4">
                    <XCircle className="h-14 w-14 text-muted-foreground mx-auto opacity-50" />
                    <p className="text-lg font-medium text-muted-foreground">
                        Listing not found
                    </p>
                    <Button
                        variant="outline"
                        onClick={() =>
                            router.push("/admin/vendor-marketplace")
                        }
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Marketplace
                    </Button>
                </div>
            </div>
        );
    }

    const { product, imagesByCatalog } = data;

    const featuredIndex = product.featuredImageIndex ?? 0;
    const featuredImage =
        product.images?.[featuredIndex] ?? product.images?.[0];

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(price);

    return (
        <div className="min-h-screen pb-12">
            {/* ───────────────── Sticky Header ───────────────── */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b mb-4 sm:mb-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    router.push("/admin/vendor-marketplace")
                                }
                                className="shrink-0"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="min-w-0">
                                <h1 className="text-base sm:text-lg font-semibold truncate">
                                    {product.title}
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                    {product.businessName} •{" "}
                                    {product.occupation}
                                </p>
                            </div>
                        </div>

                        <Button
                            size="sm"
                            onClick={() =>
                                router.push(
                                    `/admin/vendor-marketplace/${product.id}/edit`,
                                )
                            }
                        >
                            <Edit className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Edit</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* ───────────────── Main Content ───────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
                    {/* ───────── LEFT COLUMN ───────── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Featured Image */}
                        {featuredImage && (
                            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 p-1">
                                <div className="relative overflow-hidden rounded-xl bg-background">
                                    <Zoom>
                                        <img
                                            src={featuredImage}
                                            alt={product.title}
                                            className="w-full h-56 sm:h-72 lg:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </Zoom>

                                    <div className="absolute top-3 right-3 flex gap-2">
                                        {product.isFeatured && (
                                            <Badge className="bg-amber-500 text-white shadow-md">
                                                <Star className="h-3 w-3 mr-1 fill-white" />
                                                Featured
                                            </Badge>
                                        )}
                                        {product.isPriority && (
                                            <Badge className="bg-orange-500 text-white shadow-md">
                                                <Zap className="h-3 w-3 mr-1 fill-white" />
                                                Priority
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-1 w-10 bg-primary rounded-full" />
                                <h3 className="text-lg font-semibold">
                                    Description
                                </h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {product.description || (
                                    <span className="italic opacity-60">
                                        No description provided
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Images by Catalog */}
                        {Object.keys(imagesByCatalog).length > 0 && (
                            <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-1 w-10 bg-primary rounded-full" />
                                    <h3 className="text-lg font-semibold">
                                        Catalog Gallery
                                    </h3>
                                </div>

                                <div className="space-y-8">
                                    {Object.entries(imagesByCatalog).map(
  ([catalogId, group]: [string, VendorProductImagesByCatalog[number]]) => (

                                        <div key={catalogId}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <Package className="h-5 w-5 text-primary" />
                                                <h4 className="font-semibold">
                                                    {group.catalogTitle}
                                                </h4>
                                                <div className="flex-1 h-px bg-border" />
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                                {group.images
                                                    .sort(
                                                        (a, b) =>
                                                            a.sortOrder -
                                                            b.sortOrder,
                                                    )
                                                    .map((img) => (
                                                        <div
                                                            key={img.id}
                                                            className="relative"
                                                        >
                                                            <div
                                                                className={`relative overflow-hidden rounded-xl border-2 transition ${
                                                                    img.isFeatured
                                                                        ? "border-primary ring-2 ring-primary/20"
                                                                        : "border-border hover:border-primary/50"
                                                                }`}
                                                            >
                                                                <Zoom>
                                                                    <img
                                                                        src={
                                                                            img.imageUrl
                                                                        }
                                                                        className="w-full h-28 sm:h-36 object-cover"
                                                                    />
                                                                </Zoom>

                                                                {img.isFeatured && (
                                                                    <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-2">
                                                                        <Badge className="bg-white text-primary">
                                                                            <Star className="h-3 w-3 mr-1 fill-primary" />
                                                                            Featured
                                                                        </Badge>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ───────── RIGHT COLUMN ───────── */}
                    <div className="space-y-6">
                        {/* Status */}
                        <div className="bg-card border rounded-2xl p-6 shadow-sm lg:sticky lg:top-24">
                            <h3 className="font-semibold mb-3">Status</h3>
                            <div className="flex gap-2 flex-wrap">
                                <Badge
                                    className={`${
                                        product.isActive
                                            ? "bg-green-500"
                                            : "bg-gray-500"
                                    } text-white`}
                                >
                                    {product.isActive ? "Active" : "Inactive"}
                                </Badge>

                                {product.isFeatured && (
                                    <Badge className="bg-amber-500 text-white">
                                        Featured
                                    </Badge>
                                )}

                                {product.isPriority && (
                                    <Badge className="bg-orange-500 text-white">
                                        Priority
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <IndianRupee className="h-5 w-5 text-primary" />
                                Pricing
                            </h3>

                            <p className="text-2xl sm:text-3xl font-bold text-primary">
                                {formatPrice(
                                    Number(product.basePriceSingleDay),
                                )}
                            </p>

                            {!product.isSessionBased &&
                                product.basePriceMultiDay && (
                                    <p className="mt-3 text-lg">
                                        Multi-day:{" "}
                                        {formatPrice(
                                            Number(product.basePriceMultiDay),
                                        )}
                                    </p>
                                )}

                            {product.advanceValue && (
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Advance:{" "}
                                    {product.advanceType === "PERCENTAGE"
                                        ? `${product.advanceValue}%`
                                        : formatPrice(
                                              Number(product.advanceValue),
                                          )}
                                </p>
                            )}
                        </div>

                        {/* Vendor */}
                        <div className="bg-card border rounded-2xl p-6 shadow-sm">
                            <h3 className="font-semibold mb-2">
                                {product.businessName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {product.occupation}
                            </p>

                            {product.isSessionBased && (
                                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Session-based booking
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
