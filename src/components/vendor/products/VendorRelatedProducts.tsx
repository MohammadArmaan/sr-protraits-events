"use client";

import { VendorShopCardSkeleton } from "@/components/skeleton/VendorShopCardSkeleton";
import { useRelatedVendorProducts } from "@/hooks/queries/useRelatedVendorProducts";
import { VendorProductCard } from "../VendorProductCard";

interface Props {
    productUuid: string;
}

export default function VendorRelatedProducts({ productUuid }: Props) {
    const { data, isLoading } = useRelatedVendorProducts(productUuid);


    if (isLoading) {
        <div className="mt-12">
            <h3 className="text-xl font-semibold mb-6">Related Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <VendorShopCardSkeleton key={i} />
                ))}
            </div>
            ;
        </div>;
    }

    if (!data || data.products.length === 0) {
        return (
            <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4">Related Services</h3>
                <p className="text-muted-foreground text-sm">
                    No similar services available at the moment — check back
                    soon as more vendors join the platform.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <h3 className="text-xl font-semibold mb-6">You May Also Like</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.products.map((product) => (
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
        </div>
    );
}
