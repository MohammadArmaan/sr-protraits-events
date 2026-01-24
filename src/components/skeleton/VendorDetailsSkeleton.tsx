"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function VendorDetailsSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Back button */}
            <Skeleton className="h-9 w-40 mb-4" />

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-72" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* LEFT SECTION */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-card rounded-lg p-6 shadow-card space-y-6">
                        <div className="flex items-start gap-6">
                            <Skeleton className="h-24 w-24 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-64" />
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full sm:col-span-2" />
                        </div>

                        <Skeleton className="h-20 w-full" />
                    </div>

                    {/* Business Photos */}
                    <div className="bg-card rounded-lg p-6 shadow-card">
                        <Skeleton className="h-5 w-40 mb-4" />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Skeleton className="h-48 w-full rounded-lg" />
                            <Skeleton className="h-48 w-full rounded-lg" />
                            <Skeleton className="h-48 w-full rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION – BANK DETAILS */}
                <div className="space-y-6">
                    <div className="bg-card rounded-lg p-6 shadow-card">
                        <Skeleton className="h-5 w-40 mb-4" />
                        <div className="space-y-4">
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
