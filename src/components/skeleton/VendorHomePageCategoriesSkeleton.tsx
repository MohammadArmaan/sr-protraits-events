import { Skeleton } from "../ui/skeleton";

export default function VendorHomepageCategoriesSkeleton() {
    return (
        <section>
            <div className="mb-8">
                <Skeleton className="h-10 w-1/4 mb-5" />
                <Skeleton className="h-10 w-1/2 mb-5" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="h-24 rounded-2xl"
                    />
                ))}
            </div>
        </section>
    );
}
