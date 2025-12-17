import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingConfirmedSkeleton() {
    return (
        <main className="pt-28 px-4 pb-16">
            <div className="max-w-2xl mx-auto">
                {/* Success icon */}
                <div className="flex justify-center mb-8">
                    <Skeleton className="h-24 w-24 rounded-full" />
                </div>

                {/* Title */}
                <Skeleton className="h-10 w-2/3 mx-auto mb-2" />
                <Skeleton className="h-5 w-1/2 mx-auto mb-8" />

                <Card className="rounded-2xl">
                    <CardContent className="p-8 space-y-4">
                        <Skeleton className="h-6 w-1/3" />

                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-6 w-40" />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4 mt-6">
                    <Skeleton className="h-12 flex-1 rounded-pill" />
                    <Skeleton className="h-12 flex-1 rounded-pill" />
                </div>
            </div>
        </main>
    );
}
