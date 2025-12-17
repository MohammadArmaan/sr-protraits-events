import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingDecisionSkeleton() {
    return (
        <main className="pt-28 px-4 pb-16">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card className="rounded-2xl">
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-6 w-28" />

                        <div className="space-y-3">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-6 w-40" />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Skeleton className="h-11 flex-1 rounded-pill" />
                    <Skeleton className="h-11 flex-1 rounded-pill" />
                    <Skeleton className="h-11 flex-1 rounded-pill" />
                </div>
            </div>
        </main>
    );
}
