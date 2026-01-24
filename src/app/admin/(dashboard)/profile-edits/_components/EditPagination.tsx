"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function EditPagination({
    page,
    totalPages,
    onPageChange,
}: Props) {
    if (totalPages <= 1) return null;

    const pagesToShow = getPages(page, totalPages);

    return (
        <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-2 flex-wrap">
                {/* Prev */}
                <Button
                    className="bg-gradient-primary font-bold"
                    size="icon"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ChevronLeft />
                </Button>

                {/* Desktop Pages */}
                <div className="hidden sm:flex gap-1">
                    {pagesToShow.map((p, idx) =>
                        p === "dots" ? (
                            <span
                                key={idx}
                                className="px-2 text-muted-foreground"
                            >
                                …
                            </span>
                        ) : (
                            <Button
                                key={p}
                                size="icon"
                                variant={p === page ? "default" : "outline"}
                                className={cn(
                                    "w-9",
                                    p === page &&
                                        "bg-gradient-primary text-white"
                                )}
                                onClick={() => onPageChange(p)}
                            >
                                {p}
                            </Button>
                        )
                    )}
                </div>

                {/* Mobile Page Indicator */}
                <div className="sm:hidden text-sm text-muted-foreground px-2">
                    Page {page} of {totalPages}
                </div>

                {/* Next */}
                <Button
                    className="bg-gradient-primary font-bold"
                    size="icon"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
}

/* ------------------ Helpers ------------------ */
function getPages(current: number, total: number) {
    const pages: (number | "dots")[] = [];

    if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
        return pages;
    }

    pages.push(1);

    if (current > 3) pages.push("dots");

    for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
    ) {
        pages.push(i);
    }

    if (current < total - 2) pages.push("dots");

    pages.push(total);

    return pages;
}
