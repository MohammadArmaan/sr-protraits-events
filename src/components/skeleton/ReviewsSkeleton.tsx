import { Skeleton } from "../ui/skeleton";

export default function ReviewsSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Skeleton
                    key={i}
                    className="h-24 rounded-xl"
                />
            ))}
        </div>
    );
}
