"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfileEditDetailsSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl border">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-md" />

                    <div className="space-y-2">
                        <Skeleton className="h-6 w-56" />
                        <div className="flex gap-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            {/* Text Changes Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-40" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((col) => (
                        <Card key={col} className="border-2">
                            <CardHeader>
                                <Skeleton className="h-4 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[1, 2, 3].map((row) => (
                                    <div key={row} className="space-y-2">
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-10 w-full rounded-lg" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Image Section Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-48" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-72 w-full rounded-xl" />
                    <Skeleton className="h-72 w-full rounded-xl" />
                </div>
            </div>

            {/* Business Photos Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton
                                key={i}
                                className="aspect-square rounded-xl"
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Summary Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
