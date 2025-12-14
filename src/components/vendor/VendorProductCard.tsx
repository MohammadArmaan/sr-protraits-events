"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
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
    id,
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
        <Card className="group overflow-hidden rounded-2xl border-border hover:shadow-lg transition-all">
            {/* IMAGE */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={businessPhoto ?? "/placeholder.jpg"}
                    alt={businessName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <Badge className="absolute top-3 right-3 bg-card/90 backdrop-blur text-foreground">
                    {occupation}
                </Badge>
            </div>

            {/* CONTENT */}
            <CardContent className="p-5 space-y-2">
                <h3 className="text-lg font-semibold line-clamp-2">
                    {title}
                </h3>

                <p className="text-sm text-muted-foreground">
                    {businessName}
                </p>

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

                {/* PRICE */}
                <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-bold text-primary">
                        ₹{advanceAmount}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        advance
                    </span>
                </div>
            </CardContent>

            {/* CTA */}
            <CardFooter className="p-5 pt-0">
                <Button
                    onClick={() => router.push(`/products/${uuid}`)}
                    className="w-full rounded-pill bg-gradient-primary"
                >
                    Book Now
                </Button>
            </CardFooter>
        </Card>
    );
}
