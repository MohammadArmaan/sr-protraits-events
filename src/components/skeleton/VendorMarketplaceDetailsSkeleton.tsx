"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function VendorMarketplaceDetailsSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Back button */}
            <Skeleton className="h-8 w-40 mb-6" />

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-72" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Featured image */}
                    <Card>
                        <Skeleton className="h-64 lg:h-80 w-full rounded-lg" />
                    </Card>

                    {/* Thumbnails */}
                    <Card>
                        <CardContent className="p-6">
                            <Skeleton className="h-5 w-32 mb-4" />
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        className="h-32 w-full rounded-lg"
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardContent className="p-6 space-y-3">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-4 w-[80%]" />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <Card>
                        <CardContent className="p-6 space-y-3">
                            <Skeleton className="h-5 w-24" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <Skeleton className="h-5 w-24" />
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-14 w-full rounded-lg"
                                />
                            ))}
                        </CardContent>
                    </Card>

                    {/* Advance */}
                    <Card>
                        <CardContent className="p-6 space-y-3">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-20 w-full rounded-lg" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
