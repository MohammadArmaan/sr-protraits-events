// src/app/vendor/shop/ShopClient.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/shop/Pagination";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { VendorProductCard } from "@/components/vendor/VendorProductCard";
import { useVendorShopProducts } from "@/hooks/queries/useVendorShopProducts";
import { VendorShopCardSkeleton } from "@/components/skeleton/VendorShopCardSkeleton";


export default function ShopClientFull() {
    const searchParams = useSearchParams();
    const { data, isLoading } = useVendorShopProducts(searchParams);

    if (isLoading) {
        return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <VendorShopCardSkeleton key={i} />
            ))}
        </div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <ShopFilters />

            <section className="lg:col-span-3">
                {!isLoading && data?.products.length === 0 && (
                    <p className="text-muted-foreground flex items-center justify-center">
                        No vendors found with that data.
                    </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {data?.products.map((product) => (
                        <VendorProductCard
                            key={product.id}
                            id={product.id}
                            uuid={product.uuid}
                            title={product.title}
                            basePriceSingleDay={Number(
                                product.basePriceSingleDay
                            )}
                            basePriceMultiDay={Number(
                                product.basePriceMultiDay
                            )}
                            advanceType={product.advanceType}
                            advanceValue={Number(product.advanceValue)}
                            rating={Number(product.rating)}
                            ratingCount={product.ratingCount}
                            businessName={product.businessName}
                            occupation={product.occupation}
                            businessPhoto={
                                product.images[product.featuredImageIndex]
                            }
                        />
                    ))}
                </div>
                {data && (
                    <Pagination
                        page={data.meta.page}
                        totalPages={data.meta.totalPages}
                        hasNext={data.meta.hasNext}
                        hasPrev={data.meta.hasPrev}
                    />
                )}
            </section>
        </div>
    );
}
