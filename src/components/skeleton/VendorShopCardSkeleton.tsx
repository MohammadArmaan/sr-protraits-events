import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VendorShopCardSkeleton() {
    return (
        <Card className="rounded-2xl overflow-hidden">
            {/* Image */}
            <Skeleton className="h-44 w-full" />

            <CardContent className="p-4 space-y-3">
                {/* Title */}
                <Skeleton className="h-5 w-3/4" />

                {/* Vendor name */}
                <Skeleton className="h-4 w-1/2" />

                {/* Rating */}
                <Skeleton className="h-4 w-1/3" />

                {/* Price */}
                <Skeleton className="h-5 w-1/4" />

                {/* CTA */}
                <Skeleton className="h-10 w-full rounded-pill" />
            </CardContent>
        </Card>
    );
}
