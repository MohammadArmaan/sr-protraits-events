import { Card, CardContent } from "@/components/ui/card";

export const ProductSkeleton = () => {
    return (
        <main className="pt-28 px-4 md:px-8 pb-16 animate-pulse">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Image Skeleton */}
                <div className="space-y-4">
                    <div className="aspect-[4/3] rounded-2xl bg-muted" />
                    <div className="grid grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-[4/3] rounded-xl bg-muted"
                            />
                        ))}
                    </div>
                </div>

                {/* Details Skeleton */}
                <div className="space-y-6">
                    <div className="h-6 w-32 bg-muted rounded" />
                    <div className="h-10 w-3/4 bg-muted rounded" />
                    <div className="h-4 w-1/2 bg-muted rounded" />

                    <Card className="rounded-2xl">
                        <CardContent className="p-6 space-y-4">
                            <div className="h-4 w-full bg-muted rounded" />
                            <div className="h-8 w-1/3 bg-muted rounded" />
                            <div className="h-4 w-full bg-muted rounded" />
                        </CardContent>
                    </Card>

                    <div className="h-12 w-full bg-muted rounded-pill" />
                </div>
            </div>
        </main>
    );
};
