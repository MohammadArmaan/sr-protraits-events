import { Skeleton } from "@/components/ui/skeleton";

export function BannerSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-3xl">
            {/* Background */}
            <Skeleton className="h-[320px] w-full rounded-3xl" />

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center">
                <div className="px-6 md:px-12 max-w-xl space-y-4">
                    {/* Title */}
                    <Skeleton className="h-10 w-3/4" />

                    {/* Subtitle */}
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-2/3" />

                    {/* CTA buttons */}
                    <div className="flex gap-4 pt-4">
                        <Skeleton className="h-11 w-36 rounded-pill" />
                        <Skeleton className="h-11 w-28 rounded-pill" />
                    </div>
                </div>
            </div>
        </div>
    );
}
