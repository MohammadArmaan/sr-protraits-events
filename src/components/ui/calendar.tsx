"use client";

import * as React from "react";
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "lucide-react";
import {
    DayPicker,
    getDefaultClassNames,
    type DayButton,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "label",
    buttonVariant = "ghost",
    formatters,
    components,
    ...props
}: React.ComponentProps<typeof DayPicker> & {
    buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
    const defaultClassNames = getDefaultClassNames();

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("bg-background p-3", className)}
            captionLayout={captionLayout}
            formatters={{
                formatMonthDropdown: (date) =>
                    date.toLocaleString("default", { month: "short" }),
                ...formatters,
            }}
            classNames={{
                root: cn("w-fit", defaultClassNames.root),
                months: cn(
                    "flex flex-col md:flex-row gap-4",
                    defaultClassNames.months
                ),
                month: cn("space-y-4", defaultClassNames.month),
                nav: "flex items-center",
                button_previous: cn(
                    buttonVariants({ variant: buttonVariant }),
                    "absolute left-1 top-1 h-8 w-8 p-0 bg-foreground/10 hover:bg-foreground/20 border-1",
                    defaultClassNames.button_previous
                ),
                button_next: cn(
                    buttonVariants({ variant: buttonVariant }),
                    "absolute right-1 top-1 h-8 w-8 p-0 bg-foreground/10 hover:bg-foreground/20 border-1",
                    defaultClassNames.button_next
                ),
                month_caption: cn(
                    "relative flex items-center justify-center h-9",
                    defaultClassNames.month_caption
                ),
                table: "w-full border-collapse",
                weekdays: cn("flex", defaultClassNames.weekdays),
                weekday: cn(
                    "w-9 text-center text-xs text-muted-foreground",
                    defaultClassNames.weekday
                ),
                week: cn("flex mt-2", defaultClassNames.week),
                day: cn(
                    "relative w-9 h-9 p-0 text-center [&:has(button[data-selected])]:bg-transparent",
                    defaultClassNames.day
                ),
                range_start: cn(
                    "rounded-l-md bg-accent",
                    defaultClassNames.range_start
                ),
                range_middle: cn("bg-accent", defaultClassNames.range_middle),
                range_end: cn(
                    "rounded-r-md bg-accent",
                    defaultClassNames.range_end
                ),
                today: cn("bg-muted text-foreground", defaultClassNames.today),
                outside: cn(
                    "text-muted-foreground opacity-50",
                    defaultClassNames.outside
                ),
                disabled: cn(
                    "text-muted-foreground opacity-50",
                    defaultClassNames.disabled
                ),
                hidden: cn("invisible", defaultClassNames.hidden),
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    if (orientation === "left")
                        return <ChevronLeftIcon className="h-4 w-4" />;
                    if (orientation === "right")
                        return <ChevronRightIcon className="h-4 w-4" />;
                    return <ChevronDownIcon className="h-4 w-4" />;
                },
                DayButton: CalendarDayButton,
                ...components,
            }}
            {...props}
        />
    );
}

function CalendarDayButton({
    className,
    day,
    modifiers,
    ...props
}: React.ComponentProps<typeof DayButton>) {
    const ref = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);

    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            data-selected={modifiers.selected}
            className={cn(
                "h-9 w-9 rounded-md",
                modifiers.selected && "bg-gradient-primary text-primary-foreground",
                modifiers.range_middle && "bg-accent text-accent-foreground",
                className
            )}
            {...props}
        />
    );
}

export { Calendar };
