"use client";

import Link from "next/link";
import { useVendorCategories } from "@/hooks/queries/useVendorCategories";
import VendorHomepageCategoriesSkeleton from "../skeleton/VendorHomePageCategoriesSkeleton";

export function VendorBrowseByCategory() {
    const { data: categories = [], isLoading } = useVendorCategories();

    if (isLoading) {
        return (
            <VendorHomepageCategoriesSkeleton />
        );
    }

    if (categories.length === 0) return null;

    return (
        <section>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                    Browse by Category
                </h2>
                <p className="text-muted-foreground">
                    Find the perfect vendor for your needs
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                    <Link
                        key={category}
                        href={`/vendor/shop?category=${encodeURIComponent(
                            category
                        )}`}
                    >
                        <div
                            className="
                                p-6 h-24
                                rounded-2xl bg-card
                                border border-border
                                hover:shadow-md hover:-translate-y-0.5
                                transition-all duration-300
                                cursor-pointer group
                            "
                        >
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                {category}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
