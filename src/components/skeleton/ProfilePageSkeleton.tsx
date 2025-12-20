import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ProfilePageSkeleton() {
    return (
        <main className="pt-28 px-4 pb-16">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Card */}
                <Card className="rounded-2xl">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Avatar */}
                            <Skeleton className="h-32 w-32 rounded-full" />

                            {/* Name & actions */}
                            <div className="flex-1 space-y-4">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-96" />

                                <div className="flex gap-3 pt-2">
                                    <Skeleton className="h-10 w-32 rounded-pill" />
                                    <Skeleton className="h-10 w-28 rounded-pill" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="rounded-2xl">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="border rounded-xl p-4 space-y-2"
                                >
                                    <Skeleton className="h-6 w-12" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* About / Bio Card */}
                <Card className="rounded-2xl">
                    <CardContent className="p-6 space-y-3">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>

                {/* Gallery / Services Card */}
                <Card className="rounded-2xl">
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-6 w-48" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-40 w-full rounded-xl"
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Reviews Card */}
                <Card className="rounded-2xl">
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-6 w-32" />

                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="border rounded-xl p-4 space-y-3"
                            >
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

            </div>
        </main>
    );
}
