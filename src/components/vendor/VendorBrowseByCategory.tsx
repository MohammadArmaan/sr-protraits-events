"use client";

import Link from "next/link";
import { useVendorCatalogCategories } from "@/hooks/queries/useVendorCatalogCategories";
import VendorHomepageCategoriesSkeleton from "../skeleton/VendorHomePageCategoriesSkeleton";
import {
    Camera,
    Music,
    Utensils,
    Palette,
    Cake,
    Flower2,
    Video,
    Mic2,
    Sparkles,
    PartyPopper,
    Crown,
    Heart,
} from "lucide-react";
import { Button } from "../ui/button";

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, any> = {
    Photography: Camera,
    Videography: Video,
    Music: Music,
    DJ: Mic2,
    Catering: Utensils,
    Decoration: Palette,
    "Cake & Desserts": Cake,
    Florist: Flower2,
    "Event Planner": PartyPopper,
    "Makeup Artist": Sparkles,
    Bridal: Crown,
    "Wedding Planner": Heart,
};

// Gradient color schemes for each category
const CATEGORY_GRADIENTS: Record<string, string> = {
    Photography:
        "from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 hover:from-violet-500/20 hover:via-purple-500/20 hover:to-fuchsia-500/20",
    Videography:
        "from-blue-500/10 via-cyan-500/10 to-teal-500/10 hover:from-blue-500/20 hover:via-cyan-500/20 hover:to-teal-500/20",
    Music: "from-pink-500/10 via-rose-500/10 to-red-500/10 hover:from-pink-500/20 hover:via-rose-500/20 hover:to-red-500/20",
    DJ: "from-indigo-500/10 via-purple-500/10 to-pink-500/10 hover:from-indigo-500/20 hover:via-purple-500/20 hover:to-pink-500/20",
    Catering:
        "from-orange-500/10 via-amber-500/10 to-yellow-500/10 hover:from-orange-500/20 hover:via-amber-500/20 hover:to-yellow-500/20",
    Decoration:
        "from-emerald-500/10 via-green-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:via-green-500/20 hover:to-teal-500/20",
    "Cake & Desserts":
        "from-rose-500/10 via-pink-500/10 to-fuchsia-500/10 hover:from-rose-500/20 hover:via-pink-500/20 hover:to-fuchsia-500/20",
    Florist:
        "from-green-500/10 via-emerald-500/10 to-lime-500/10 hover:from-green-500/20 hover:via-emerald-500/20 hover:to-lime-500/20",
    "Event Planner":
        "from-purple-500/10 via-violet-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:via-violet-500/20 hover:to-indigo-500/20",
    "Makeup Artist":
        "from-fuchsia-500/10 via-pink-500/10 to-rose-500/10 hover:from-fuchsia-500/20 hover:via-pink-500/20 hover:to-rose-500/20",
    Bridal: "from-amber-500/10 via-yellow-500/10 to-orange-500/10 hover:from-amber-500/20 hover:via-yellow-500/20 hover:to-orange-500/20",
    "Wedding Planner":
        "from-red-500/10 via-rose-500/10 to-pink-500/10 hover:from-red-500/20 hover:via-rose-500/20 hover:to-pink-500/20",
};

// Icon color schemes
const CATEGORY_ICON_COLORS: Record<string, string> = {
    Photography: "text-violet-600 dark:text-violet-400",
    Videography: "text-blue-600 dark:text-blue-400",
    Music: "text-pink-600 dark:text-pink-400",
    DJ: "text-indigo-600 dark:text-indigo-400",
    Catering: "text-orange-600 dark:text-orange-400",
    Decoration: "text-emerald-600 dark:text-emerald-400",
    "Cake & Desserts": "text-rose-600 dark:text-rose-400",
    Florist: "text-green-600 dark:text-green-400",
    "Event Planner": "text-purple-600 dark:text-purple-400",
    "Makeup Artist": "text-fuchsia-600 dark:text-fuchsia-400",
    Bridal: "text-amber-600 dark:text-amber-400",
    "Wedding Planner": "text-red-600 dark:text-red-400",
};

// Default fallback
const DEFAULT_GRADIENT =
    "from-gray-500/10 via-slate-500/10 to-zinc-500/10 hover:from-gray-500/20 hover:via-slate-500/20 hover:to-zinc-500/20";
const DEFAULT_ICON_COLOR = "text-gray-600 dark:text-gray-400";

function getCategoryIcon(categoryName: string) {
    return CATEGORY_ICONS[categoryName] || Sparkles;
}

function getCategoryGradient(categoryName: string) {
    return CATEGORY_GRADIENTS[categoryName] || DEFAULT_GRADIENT;
}

function getCategoryIconColor(categoryName: string) {
    return CATEGORY_ICON_COLORS[categoryName] || DEFAULT_ICON_COLOR;
}

export function VendorBrowseByCategory() {
    const { data: categories = [], isLoading } = useVendorCatalogCategories();

    const visibleCategories = categories
        .filter((cat) => cat.isActive)
        .slice(0, 8);

    if (isLoading) {
        return <VendorHomepageCategoriesSkeleton />;
    }

    if (categories.length === 0) return null;

    return (
        <section className="py-12 md:py-16">
            <div className="mb-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
                    Browse by Category
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Discover top-rated vendors across all categories for your
                    perfect event
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                {visibleCategories.map((category, index) => {
                    const Icon = getCategoryIcon(category.name);
                    const gradient = getCategoryGradient(category.name);
                    const iconColor = getCategoryIconColor(category.name);

                    return (
                        <Link
                            key={category.id}
                            href={`/vendor/shop?categoryId=${category.id}&category=${encodeURIComponent(
                                category.name,
                            )}&page=1`}
                            className="group"
                            style={{
                                animationDelay: `${index * 50}ms`,
                            }}
                        >
                            <div
                                className={`
                                        relative
                                        p-6 h-36
                                        rounded-2xl 
                                        bg-gradient-to-br ${gradient}
                                        border border-border/50
                                        backdrop-blur-sm
                                        hover:shadow-lg hover:shadow-black/5
                                        hover:border-border
                                        hover:-translate-y-1
                                        hover:scale-[1.02]
                                        transition-all duration-300 ease-out
                                        cursor-pointer
                                        overflow-hidden
                                        flex flex-col items-center justify-center
                                        text-center
                                        animate-in fade-in slide-in-from-bottom-4
                                    `}
                            >
                                {/* Decorative circle background */}
                                <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                                {/* Icon */}
                                <div className="relative mb-3 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                    <div
                                        className={`p-3 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm ${iconColor}`}
                                    >
                                        <Icon
                                            className="w-6 h-6"
                                            strokeWidth={2}
                                        />
                                    </div>
                                </div>

                                {/* Category Name */}
                                <h3 className="relative text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
                                    {category.name}
                                </h3>

                                {/* Subtle shine effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                            </div>
                        </Link>
                    );
                })}
                {categories.filter((cat) => cat.isActive).length > 8 && (
                    <div className="text-center mt-10">
                        <Link href="/vendor/categories">
                            <Button variant="outline" size="lg" className="bg-gradient-primary">
                                View All Categories →
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
