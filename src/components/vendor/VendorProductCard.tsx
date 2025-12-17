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

    basePriceSingleDay: number;
    basePriceMultiDay: number;

    advanceType: "FIXED" | "PERCENTAGE";
    advanceValue: number;

    rating: number;
    ratingCount: number;

    businessName: string;
    occupation: string;

    businessPhoto: string;
}

export function VendorProductCard({
    uuid,
    title,
    basePriceSingleDay,
    basePriceMultiDay,
    advanceType,
    advanceValue,
    rating,
    ratingCount,
    businessName,
    occupation,
    businessPhoto,
}: VendorProductCardProps) {
    const router = useRouter();

    const startingPrice = Math.min(basePriceSingleDay, basePriceMultiDay);

    const advanceAmount =
        advanceType === "PERCENTAGE"
            ? Math.round((startingPrice * advanceValue) / 100)
            : advanceValue;

    return (
        <Card className="group relative overflow-hidden rounded-2xl border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            {/* IMAGE */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                <img
                    src={businessPhoto ?? "/placeholder.jpg"}
                    alt={businessName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <Badge className="absolute top-3 right-3 bg-card/90 backdrop-blur bg-gradient-primary border-none font-bold">
                    {occupation}
                </Badge>
            </div>

            {/* CONTENT */}
            <CardContent className="p-5 space-y-3">
                <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{businessName}</p>

                {/* RATING */}
                <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm font-medium">
                        {rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        ({ratingCount})
                    </span>
                </div>

                {/* PRICING */}
                <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            Starting from
                        </span>
                        <span className="font-medium">
                            ₹{startingPrice.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
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
                    className="w-full bg-gradient-primary flex gap-2"
                >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
