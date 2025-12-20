import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VendorBankDetailsSkeleton() {
    return (
        <Card className="rounded-2xl mt-10">
            <CardContent className="p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-56" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                </div>

                {/* Existing details box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border rounded-lg p-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-36" />
                </div>

                {/* Alert */}
                <Skeleton className="h-12 w-full rounded-lg" />

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                    <Skeleton className="h-4 w-72" />
                </div>

                {/* Button */}
                <Skeleton className="h-11 w-52 rounded-full" />
            </CardContent>
        </Card>
    );
}
