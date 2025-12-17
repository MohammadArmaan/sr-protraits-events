import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VendorBookingFormSkeleton() {
    return (
        <Card className="rounded-2xl">
            <CardContent className="p-6 space-y-6">
                <Skeleton className="h-7 w-1/3" />

                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />

                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>

                <Skeleton className="h-12 w-full rounded-pill" />
            </CardContent>
        </Card>
    );
}
