"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Star, IndianRupee } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import Zoom from "react-medium-image-zoom";
import { useAdminVendorProduct } from "@/hooks/queries/admin/vendor-marketplace/useAdminVendorProduct";

export default function VendorMarketplaceDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const productId = Number(id);

    const { data, isLoading } = useAdminVendorProduct(productId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Loading listing...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Listing not found</p>
            </div>
        );
    }

    const listing = data.product;

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(price);

    return (
        <div className="animate-fade-in">
            {/* Back */}
            <Button
                variant="ghost"
                onClick={() => router.push("/admin/vendor-marketplace")}
                className="mb-4 text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
            </Button>

            {/* Header */}
            <PageHeader
                title={listing.title}
                description={`${listing.businessName} • ${listing.occupation}`}
            >
                <Button
                    onClick={() =>
                        router.push(
                            `/admin/vendor-marketplace/${listing.id}/edit`,
                        )
                    }
                    className="bg-gradient-primary text-primary-foreground"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Listing
                </Button>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Featured Image */}
                    <div className="bg-card rounded-lg overflow-hidden shadow-card">
                        <Zoom>
                            <img
                                src={
                                    listing.images[
                                        listing.featuredImageIndex ?? 0
                                    ]
                                }
                                alt={listing.title}
                                className="w-full h-64 lg:h-80 object-cover"
                            />
                        </Zoom>
                    </div>

                    {/* All Images */}
                    {listing.images.length > 1 && (
                        <div className="bg-card rounded-lg p-6 shadow-card">
                            <h3 className="font-semibold text-foreground mb-4">
                                All Images
                            </h3>
                            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                                {listing.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`relative rounded-lg overflow-hidden border-2 ${
                                            index === listing.featuredImageIndex
                                                ? "border-primary"
                                                : "border-border"
                                        }`}
                                    >
                                        <Zoom>
                                            <img
                                                src={image}
                                                alt={`${listing.title} ${index + 1}`}
                                                className="w-full h-32 object-cover"
                                            />
                                        </Zoom>
                                        {index ===
                                            listing.featuredImageIndex && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs text-center py-1">
                                                Featured
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="bg-card rounded-lg p-6 shadow-card">
                        <h3 className="font-semibold text-foreground mb-3">
                            Description
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {listing.description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-card rounded-lg p-6 shadow-card">
                        <h3 className="font-semibold text-foreground mb-4">
                            Status
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge
                                variant={
                                    listing.isActive ? "default" : "secondary"
                                }
                            >
                                {listing.isActive ? "Active" : "Inactive"}
                            </Badge>

                            {listing.isFeatured && (
                                <Badge className="bg-accent text-accent-foreground">
                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                    Featured
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-card rounded-lg p-6 shadow-card">
                        <h3 className="font-semibold text-foreground mb-4">
                            Pricing
                        </h3>

                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">
                                    Single Day Price
                                </p>
                                <p className="font-semibold text-lg text-foreground flex items-center">
                                    <IndianRupee className="h-4 w-4" />
                                    {listing.basePriceSingleDay.toLocaleString(
                                        "en-IN",
                                    )}
                                </p>
                            </div>

                            <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">
                                    Multi-Day Price
                                </p>
                                <p className="font-semibold text-lg text-foreground flex items-center">
                                    <IndianRupee className="h-4 w-4" />
                                    {listing.basePriceMultiDay.toLocaleString(
                                        "en-IN",
                                    )}
                                </p>
                            </div>

                            <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">
                                    Pricing Unit
                                </p>
                                <p className="font-medium text-foreground">
                                    {listing.pricingUnit === "PER_DAY"
                                        ? "Per Day"
                                        : "Per Event"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Advance */}
                    <div className="bg-card rounded-lg p-6 shadow-card">
                        <h3 className="font-semibold text-foreground mb-4">
                            Advance Payment
                        </h3>

                        <div className="p-4 rounded-lg bg-gradient-primary text-primary-foreground">
                            <p className="text-sm opacity-90">
                                Required Advance
                            </p>
                            <p className="text-2xl font-bold">
                                {listing.advanceType === "FIXED"
                                    ? formatPrice(listing.advanceValue)
                                    : `${listing.advanceValue}%`}
                            </p>
                            <p className="text-xs opacity-75 mt-1 font-semibold">
                                {listing.advanceType === "FIXED"
                                    ? "Fixed Amount"
                                    : "Percentage of Total"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
