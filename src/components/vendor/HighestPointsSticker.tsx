"use client";

import { useHighestVendorPoints } from "@/hooks/queries/useHighestVendorPoints";
import { Trophy, Award, Calendar, CheckCircle2, Sparkles } from "lucide-react";

export function HighestPointsSticker() {
    const { data, isLoading } = useHighestVendorPoints("monthly");

    if (isLoading || !data || data.length === 0) return null;

    const topVendor = data[0];
    const renderContent = () => (
        <>
            {/* Trophy */}
            <div className="flex items-center gap-2 dark:bg-amber-500/20 bg-yellow-400/30 rounded-full px-4 py-2 border border-yellow-500/90 dark:border-amber-500/30">
                <Trophy className="h-5 w-5 text-yellow-500 dark:text-amber-400" />
                <span className="dark:text-amber-300 text-yellow-500 font-semibold">Winner</span>
            </div>

            {/* Vendor */}
            <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <span className="text-foreground font-bold text-lg">
                    {topVendor.fullName}
                </span>
            </div>

            {/* Points */}
            <div className="bg-gradient-primary rounded-full px-4 py-2 shadow-lg">
                <span className="text-primary-foreground font-bold">
                    {topVendor.points.toLocaleString()} pts
                </span>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Experience */}
            <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">
                    {topVendor.experience}+ years exp
                </span>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Events */}
            <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="font-medium">
                    {topVendor.successfulEventsCompleted} events
                </span>
            </div>

            <div className="w-8" />
        </>
    );

    return (
        <div className="w-full mt-5">
            {/* Static Header - Always Visible */}
            <div className="relative overflow-hidden rounded-t-lg bg-gradient-primary px-4 py-2.5 shadow-lg text-primary-foreground">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

                <div className="relative flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                    <span className="text-sm font-bold text-white tracking-wide uppercase">
                        🏆 Monthly Top Vendor
                    </span>
                    <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                </div>
            </div>

            {/* Scrolling Content Area */}
            <div className="relative overflow-hidden rounded-b-lg bg-background shadow-xl text-foreground">
                {/* Shine effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shine" />

                <div className="marquee-container py-4">
                    <div className="animate-marquee flex items-center gap-8 px-6">
                        {/* Duplicate content for seamless loop */}
                        <div className="flex items-center gap-8 shrink-0 px-6">
                            {renderContent()}
                        </div>

                        <div className="flex items-center gap-8 shrink-0 px-6">
                            {renderContent()}
                        </div>

                        <div className="flex items-center gap-8 shrink-0 px-6">
                            {renderContent()}
                        </div>

                        <div className="flex items-center gap-8 shrink-0 px-6">
                            {renderContent()}
                        </div>
                    </div>
                </div>

                {/* Gradient fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
            </div>
        </div>
    );
}
