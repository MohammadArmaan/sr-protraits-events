"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface VendorProductCardProps {
    id: number;
    uuid: string;
    title: string;
    basePrice: number;
    advanceType: "FIXED" | "PERCENTAGE";
    advanceValue: number;
    rating: number;
    ratingCount: number;
    businessName: string;
    occupation: string;
    profilePhoto?: string | null;
    businessPhoto: string;
}

export function VendorProductCard({
    uuid,
    title,
    basePrice,
    advanceType,
    advanceValue,
    rating,
    ratingCount,
    businessName,
    occupation,
    businessPhoto,
}: VendorProductCardProps) {
    const router = useRouter();

    const advanceAmount =
        advanceType === "PERCENTAGE"
            ? Math.round((basePrice * advanceValue) / 100)
            : advanceValue;

    return (
        <Card
            className="
                group relative overflow-hidden rounded-2xl
                border-border bg-card
                transition-all duration-300
                hover:-translate-y-1 hover:shadow-xl
            "
        >
            {/* IMAGE */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                <img
                    src={businessPhoto ?? "/placeholder.jpg"}
                    alt={businessName}
                    className="
            w-full h-full object-cover
            rounded-t-2xl
            transition-transform duration-700
            group-hover:scale-110
            will-change-transform
        "
                />

                {/* Gradient Overlay */}
                <div
                    className="
            absolute inset-0
            rounded-t-2xl
            bg-gradient-to-t from-black/40 via-black/10 to-transparent
            opacity-0 group-hover:opacity-100
            transition-opacity
        "
                />

                {/* Occupation Badge */}
                <Badge
                    className="
            absolute top-3 right-3
            bg-card/90 backdrop-blur
            text-foreground
            transition-transform
            group-hover:scale-105
        "
                >
                    {occupation}
                </Badge>
            </div>

            {/* CONTENT */}
            <CardContent className="p-5 space-y-3">
                <h3 className="text-lg font-semibold leading-snug line-clamp-2">
                    {title}
                </h3>

                <p className="text-sm text-muted-foreground">{businessName}</p>

                {/* RATING */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="text-sm font-medium">
                            {rating.toFixed(1)}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        ({ratingCount} reviews)
                    </span>
                </div>

                {/* PRICING */}
                <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Base Price
                        </span>
                        <span className="text-sm font-medium">
                            ₹{basePrice.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Advance
                        </span>
                        <span className="text-xl font-bold text-primary">
                            ₹{advanceAmount.toLocaleString()}
                        </span>
                    </div>
                </div>
            </CardContent>

            {/* CTA */}
            <CardFooter className="p-5 pt-0">
                <Button
                    onClick={() => router.push(`/vendor/product/${uuid}`)}
                    className="
                        w-full rounded-pill
                        bg-gradient-primary
                        flex items-center justify-center gap-2
                        transition-all
                        group-hover:shadow-lg
                    "
                >
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </CardFooter>
        </Card>
    );
}
