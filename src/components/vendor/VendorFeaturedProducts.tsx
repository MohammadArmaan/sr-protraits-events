"use client";

import { useFeaturedVendorProducts } from "@/hooks/queries/useFeaturedVendorProducts";
import { VendorProductCard } from "./VendorProductCard";
import { VendorShopCardSkeleton } from "../skeleton/VendorShopCardSkeleton";
import { Skeleton } from "../ui/skeleton";

export function VendorFeaturedProducts() {
    const { data, isLoading } = useFeaturedVendorProducts();

    if (isLoading) {
        return (
            <section className="py-12">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-10 w-1/4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <VendorShopCardSkeleton key={i} />
                    ))}
                </div>
            </section>
        );
    }

    if (!data || data.length === 0) {
        return (
            <section className="py-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">Featured Vendors</h2>
                </div>
                <p className="text-muted-foreground flex items-center justify-center">
                    No vendors found with that data.
                </p>
            </section>
        );
    }

    return (
        <section className="py-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Featured Vendors</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((product) => (
                    <VendorProductCard
                        key={product.id}
                        id={product.id}
                        uuid={product.uuid}
                        title={product.title}
                        basePriceSingleDay={Number(product.basePriceSingleDay)}
                        basePriceMultiDay={Number(product.basePriceMultiDay)}
                        advanceType={product.advanceType}
                        advanceValue={Number(product.advanceValue)}
                        rating={Number(product.rating)}
                        ratingCount={product.ratingCount}
                        occupation={product.occupation}
                        featuredImage={
                            product.featuredImageUrl
                        }
                    />
                ))}
            </div>
        </section>
    );
}
