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

import { updateMultipleQueries } from "@/lib/vendor/shop-url";
import { useVendorPriceRange } from "@/hooks/queries/useVendorPriceRange";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Filter } from "lucide-react";
import { useVendorCatalogCategories } from "@/hooks/queries/useVendorCatalogCategories";

export function ShopFiltersComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);

    const { data: categories = [] } = useVendorCatalogCategories();
    const { data: priceData, isLoading: priceLoading } = useVendorPriceRange();

    const minAllowed = priceData?.minPrice ?? 0;
    const maxAllowed = priceData?.maxPrice ?? 100000;

    const [q, setQ] = useState(searchParams.get("q") ?? "");
    const [category, setCategory] = useState(
        searchParams.get("categoryId") ?? "all",
    );
    const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");
    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get("minPrice") ?? minAllowed),
        Number(searchParams.get("maxPrice") ?? maxAllowed),
    ]);

    function applyFilters() {
        updateMultipleQueries(router, searchParams, {
            q: q.trim() || null,
            categoryId: category === "all" ? null : category,
            sort,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
        });

        setOpen(false);
    }

    function resetFilters() {
        router.push("/vendor/shop");
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Filter Vendors</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Search */}
                    <div>
                        <Label>Search</Label>
                        <Input
                            placeholder="Search services..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
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
                                    <SelectItem
                                        key={cat.id}
                                        value={cat.id.toString()}
                                    >
                                        {cat.name}
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
                                <div className="flex justify-between text-sm mt-2">
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
                            className="w-full bg-gradient-primary"
                            onClick={applyFilters}
                            disabled={priceLoading}
                        >
                            Apply Filters
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={resetFilters}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
