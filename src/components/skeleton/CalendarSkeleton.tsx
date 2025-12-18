export default function CalendarSkeleton() {
    return (
        <div className="pt-28 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="h-8 w-48 bg-muted rounded" />
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-[500px] bg-muted rounded-2xl" />
                    <div className="h-[500px] bg-muted rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
