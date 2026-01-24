"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

import { useVendorCategories } from "@/hooks/queries/useVendorCategories";
import { updateMultipleQueries } from "@/lib/vendor/shop-url";
import { useVendorPriceRange } from "@/hooks/queries/useVendorPriceRange";

export function ShopFiltersComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    /* ------------------ DATA ------------------ */
    const { data: categories = [] } = useVendorCategories();
    const {
        data: priceData,
        isLoading: priceLoading,
    } = useVendorPriceRange();

    const minAllowed = priceData?.minPrice ?? 0;
    const maxAllowed = priceData?.maxPrice ?? 100000;

    /* ------------------ INITIAL STATE (FROM URL) ------------------ */
    const [q, setQ] = useState(searchParams.get("q") ?? "");
    const [category, setCategory] = useState(
        searchParams.get("category") ?? "all"
    );
    const [sort, setSort] = useState(
        searchParams.get("sort") ?? "newest"
    );

    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get("minPrice") ?? minAllowed),
        Number(searchParams.get("maxPrice") ?? maxAllowed),
    ]);

    /* ------------------ ACTIONS ------------------ */
    function applyFilters() {
        updateMultipleQueries(router, searchParams, {
            q: q.trim() || null,
            category: category === "all" ? null : category,
            sort,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
        });
    }

    function resetFilters() {
        router.push("/vendor/shop");
    }

    /* ------------------ UI ------------------ */
    return (
        <aside className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                {/* Search */}
                <div>
                    <Label>Search</Label>
                    <Input
                        placeholder="Search services..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") applyFilters();
                        }}
                    />
                </div>

                {/* Category */}
                <div>
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Price Range */}
                <div>
                    <Label>Price Range</Label>

                    {priceLoading ? (
                        <div className="h-8 rounded-md bg-muted animate-pulse" />
                    ) : (
                        <>
                            <Slider
                                min={minAllowed}
                                max={maxAllowed}
                                step={1000}
                                value={priceRange}
                                onValueChange={(v) =>
                                    setPriceRange(v as [number, number])
                                }
                            />
                            <div className="flex justify-between text-sm text-muted-foreground mt-2">
                                <span>₹{priceRange[0]}</span>
                                <span>₹{priceRange[1]}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Sort */}
                <div>
                    <Label>Sort By</Label>
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="rating_desc">
                                Highest Rating
                            </SelectItem>
                            <SelectItem value="price_asc">
                                Price: Low → High
                            </SelectItem>
                            <SelectItem value="price_desc">
                                Price: High → Low
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <Button
                        className="w-full bg-gradient-primary font-bold"
                        onClick={applyFilters}
                        disabled={priceLoading}
                    >
                        {!priceLoading ? "Apply Filters" : "Applying Filters..."}
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={resetFilters}
                    >
                        View All Vendors
                    </Button>
                </div>
            </div>
        </aside>
    );
}
