"use client";

import { useEffect, useMemo, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

import { useVendorProduct } from "@/hooks/queries/useVendorProduct";
import { VendorBookingForm } from "@/components/vendor/booking/VendorBookingForm";
import { ProductSkeleton } from "@/components/skeleton/VendorProductSkeleton";
import { useVendor } from "@/hooks/queries/useVendor";
import VendorRelatedProducts from "@/components/vendor/products/VendorRelatedProducts";
import ProductReviews from "@/components/vendor/reviews/ProductReviews";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Props {
    uuid: string;
}

export function ProductClient({ uuid }: Props) {
    const { data: product, isLoading, error } = useVendorProduct(uuid);
    const { data: me } = useVendor();

    /* -------------------- Hooks MUST be first -------------------- */

    const catalogs = product?.imagesByCatalog
        ? Object.entries(product.imagesByCatalog)
        : [];

    const [selectedCatalogId, setSelectedCatalogId] = useState<string>("");

    const [activeImageId, setActiveImageId] = useState<number | null>(null);

    /* -------------------- Derived Values -------------------- */

    const selectedCatalog =
        product && selectedCatalogId
            ? (product.imagesByCatalog[Number(selectedCatalogId)] ?? null)
            : null;

    const images = selectedCatalog?.images || [];

    const featuredImage = useMemo(() => {
        if (!selectedCatalog) return null;

        const featured = selectedCatalog.images.find(
            (img) => img.id === selectedCatalog.featuredImageId,
        );

        return featured || selectedCatalog.images[0] || null;
    }, [selectedCatalog]);

    const displayImage =
        activeImageId !== null
            ? images.find((img) => img.id === activeImageId)
            : featuredImage;

    /* -------------------- Set Default Catalog -------------------- */

    // This runs only when product loads
    useEffect(() => {
        if (!selectedCatalogId && catalogs.length > 0) {
            setSelectedCatalogId(String(catalogs[0][0]));
        }
    }, [catalogs, selectedCatalogId]);

    /* -------------------- Loading States -------------------- */

    if (isLoading) return <ProductSkeleton />;

    if (error || !product) {
        return (
            <div className="pt-28 text-center text-muted-foreground">
                {error ? "Failed to load product" : "Product not found"}
            </div>
        );
    }

    /* -------------------- UI -------------------- */

    return (
        <main className="pt-28 px-4 md:px-8 pb-16">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* ================= IMAGE GALLERY ================= */}
                <div className="space-y-4">
                    {catalogs.length > 0 && (
                        <>
                            <Select
                                value={selectedCatalogId}
                                onValueChange={(value) => {
                                    setSelectedCatalogId(value);
                                    setActiveImageId(null);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="View Catalogs" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel className="text-muted-foreground">
                                            Catalogs
                                        </SelectLabel>

                                        {catalogs.map(([catalogId, group]) => (
                                            <SelectItem
                                                key={catalogId}
                                                value={String(catalogId)}
                                            >
                                                {group.catalogTitle}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <h3 className="text-lg font-semibold">
                                {selectedCatalog?.catalogTitle}
                            </h3>

                            {displayImage && (
                                <>
                                    <Zoom>
                                        <div className="aspect-[4/3] rounded-2xl overflow-hidden cursor-zoom-in">
                                            <img
                                                src={displayImage.imageUrl}
                                                alt={product.title}
                                                className="w-full h-full object-cover rounded-2xl"
                                            />
                                        </div>
                                    </Zoom>

                                    <div className="grid grid-cols-4 gap-3">
                                        {images.map((img) => (
                                            <button
                                                key={img.id}
                                                onClick={() =>
                                                    setActiveImageId(img.id)
                                                }
                                                className={`aspect-[4/3] rounded-xl overflow-hidden border ${
                                                    img.id === displayImage?.id
                                                        ? "border-primary"
                                                        : "border-border opacity-70 hover:opacity-100"
                                                }`}
                                            >
                                                <img
                                                    src={img.imageUrl}
                                                    alt="Gallery"
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* ================= DETAILS ================= */}
                <div className="space-y-6">
                    <div>
                        <Badge className="mb-3 bg-gradient-primary font-bold border-gradient-primary">
                            {product.occupation}
                        </Badge>

                        <h1 className="text-4xl font-bold">{product.title}</h1>


                        <div className="flex items-center gap-2 mt-3">
                            <Star className="h-5 w-5 fill-accent text-accent" />
                            <span className="font-medium">
                                {Number(product.rating || 0).toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                ({product.ratingCount || 0} reviews)
                            </span>
                        </div>
                    </div>

                    <Card className="rounded-2xl">
                        <CardContent className="p-6 space-y-4">
                            {product.isSessionBased ? (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Session Price
                                        </span>
                                        <span className="font-medium">
                                            ₹
                                            {product.basePriceSingleDay.toLocaleString()}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        Max Session Hours:{" "}
                                        {product.maxSessionHours}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Single Day Price
                                        </span>
                                        <span className="font-medium">
                                            ₹
                                            {product.basePriceSingleDay.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Multi-Day Price (per day)
                                        </span>
                                        <span className="font-medium">
                                            ₹
                                            {product.basePriceMultiDay.toLocaleString()}
                                        </span>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-between pt-3 border-t">
                                <span className="text-muted-foreground">
                                    Advance Payment
                                </span>
                                <span className="text-lg font-bold text-primary">
                                    {product.advanceType === "PERCENTAGE"
                                        ? `${product.advanceValue}%`
                                        : `₹${product.advanceValue.toLocaleString()}`}
                                </span>
                            </div>

                            {product.description && (
                                <p className="text-sm text-muted-foreground pt-3 border-t">
                                    {product.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <VendorBookingForm
                        vendorId={product.vendorId}
                        vendorProductId={product.id}
                        basePriceSingleDay={product.basePriceSingleDay}
                        basePriceMultiDay={product.basePriceMultiDay}
                        advanceType={product.advanceType}
                        advanceValue={product.advanceValue}
                        isSessionBased={product.isSessionBased}
                        maxSessionHours={product.maxSessionHours}
                        loggedInVendorId={me?.vendor.id}
                    />
                </div>
            </div>

            <VendorRelatedProducts productUuid={uuid} />

            <ProductReviews
                productUuid={uuid}
                isOwnProduct={product.vendorId === me?.vendor.id}
            />
        </main>
    );
}
