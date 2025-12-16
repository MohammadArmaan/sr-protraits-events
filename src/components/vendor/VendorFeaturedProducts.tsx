"use client";

import { useFeaturedVendorProducts } from "@/hooks/queries/useFeaturedVendorProducts";
import { VendorProductCard } from "./VendorProductCard";

export function VendorFeaturedProducts() {
    const { data, isLoading } = useFeaturedVendorProducts();

    if (isLoading) {
        return null; // skeleton later
    }

    if (!data || data.length === 0) {
        return null;
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
                        businessName={product.businessName}
                        occupation={product.occupation}
                        businessPhoto={
                            product.images[product.featuredImageIndex]
                        }
                    />
                ))}
            </div>
        </section>
    );
}
