import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingPaymentSkeleton() {
    return (
        <main className="pt-28 px-4 pb-16">
            <div className="max-w-xl mx-auto">
                <Card className="rounded-2xl">
                    <CardContent className="p-6 space-y-6">
                        <Skeleton className="h-8 w-2/3" />

                        <div className="space-y-3">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-6 w-40" />
                        </div>

                        <Skeleton className="h-11 w-full rounded-pill" />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
