"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Pagination } from "@/components/shop/Pagination";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { VendorProductCard } from "@/components/vendor/VendorProductCard";
import { useVendorShopProducts } from "@/hooks/queries/useVendorShopProducts";
import { VendorShopCardSkeleton } from "@/components/skeleton/VendorShopCardSkeleton";
import { useShopSubCategories } from "@/hooks/queries/useShopSubCategories";

export default function ShopClientFull() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const categoryId = searchParams.get("categoryId");
    const subCategoryId = searchParams.get("subCategoryId");

    const { data, isLoading } = useVendorShopProducts(searchParams);

    const { data: subCategories = [] } = useShopSubCategories(
        categoryId || undefined,
    );

    /* ------------------ AUTO SELECT FIRST SUBCATEGORY ------------------ */
    useEffect(() => {
        if (categoryId && subCategories.length > 0 && !subCategoryId) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("subCategoryId", subCategories[0].id.toString());
            router.replace(`/vendor/shop?${params.toString()}`);
        }
    }, [categoryId, subCategories, subCategoryId, router]);

    const handlePillClick = (id: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("subCategoryId", id.toString());
        params.set("page", "1");
        router.push(`/vendor/shop?${params.toString()}`);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <VendorShopCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <section className="lg:col-span-3 space-y-6">
                {/* ------------------ SUBCATEGORY PILLS ------------------ */}
                {categoryId && subCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {subCategories.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => handlePillClick(sub.id)}
                                className={`px-4 py-2 rounded-full text-sm border transition
                                ${
                                    subCategoryId === sub.id.toString()
                                        ? "bg-gradient-primary text-white border-gradient-primary"
                                        : "bg-background hover:bg-muted"
                                }`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}

                <ShopFilters />

                {!isLoading && data?.products.length === 0 && (
                    <p className="text-muted-foreground flex items-center justify-center">
                        No vendors found with that data.
                    </p>
                )}

                {/* ------------------ PRODUCT GRID ------------------ */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {data?.products.map((product) => (
                        <VendorProductCard
                            key={product.id}
                            id={product.id}
                            uuid={product.uuid}
                            title={product.title}
                            basePriceSingleDay={Number(
                                product.basePriceSingleDay,
                            )}
                            basePriceMultiDay={Number(
                                product.basePriceMultiDay,
                            )}
                            advanceType={product.advanceType}
                            advanceValue={Number(product.advanceValue)}
                            rating={Number(product.rating)}
                            ratingCount={product.ratingCount}
                            occupation={product.subCategoryName}
                            featuredImage={product.featuredImageUrl}
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
