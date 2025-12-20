"use client";

import { useState } from "react";
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

interface Props {
    uuid: string;
}

export function ProductClient({ uuid }: Props) {
    const { data: product, isLoading, error } = useVendorProduct(uuid);
    const [activeImage, setActiveImage] = useState<number | null>(null);
    const { data: me } = useVendor();

    // SINGLE loading check - this was the main issue!
    if (isLoading) {
        return <ProductSkeleton />;
    }

    // Handle error or missing product
    if (error || !product) {
        return (
            <div className="pt-28 text-center text-muted-foreground">
                {error ? "Failed to load product" : "Product not found"}
            </div>
        );
    }

    const images = product.images || [];
    const featuredIndex = product.featuredImageIndex ?? 0;
    const displayIndex = activeImage ?? featuredIndex;

    return (
        <main className="pt-28 px-4 md:px-8 pb-16">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* IMAGE GALLERY */}
                <div className="space-y-4">
                    {images.length > 0 && (
                        <>
                            <Zoom>
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden cursor-zoom-in">
                                    <img
                                        src={images[displayIndex]}
                                        alt={product.title}
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                </div>
                            </Zoom>

                            <div className="grid grid-cols-4 gap-3">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`aspect-[4/3] rounded-xl overflow-hidden border ${
                                            idx === displayIndex
                                                ? "border-primary"
                                                : "border-border opacity-70 hover:opacity-100"
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Gallery ${idx}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* DETAILS */}
                <div className="space-y-6">
                    <div>
                        <Badge className="mb-3 bg-gradient-primary font-bold border-gradient-primary">
                            {product.occupation}
                        </Badge>

                        <h1 className="text-4xl font-bold">{product.title}</h1>

                        <p className="text-muted-foreground mt-2">
                            {product.businessName}
                        </p>

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

                    {/* PRICING INFO */}
                    <Card className="rounded-2xl">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Single Day Price
                                </span>
                                <span className="font-medium">
                                    ₹
                                    {Number(
                                        product.basePriceSingleDay || 0
                                    ).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Multi-Day Price (per day)
                                </span>
                                <span className="font-medium">
                                    ₹
                                    {Number(
                                        product.basePriceMultiDay || 0
                                    ).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between pt-3 border-t">
                                <span className="text-muted-foreground">
                                    Advance Payment
                                </span>
                                <span className="text-lg font-bold text-primary">
                                    {product.advanceType === "PERCENTAGE"
                                        ? `${product.advanceValue}%`
                                        : `₹${Number(
                                              product.advanceValue || 0
                                          ).toLocaleString()}`}
                                </span>
                            </div>

                            {product.description && (
                                <p className="text-sm text-muted-foreground pt-3 border-t">
                                    {product.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* BOOKING FORM */}
                    <VendorBookingForm
                        vendorId={product.vendorId}
                        vendorProductId={product.id}
                        basePriceSingleDay={Number(
                            product.basePriceSingleDay || 0
                        )}
                        basePriceMultiDay={Number(
                            product.basePriceMultiDay || 0
                        )}
                        advanceType={product.advanceType}
                        advanceValue={Number(product.advanceValue || 0)}
                        loggedInVendorId={me?.id}
                    />
                </div>
            </div>
            <VendorRelatedProducts productUuid={uuid} />
        </main>
    );
}
