"use client";

import { useEffect, useMemo, useState } from "react";
import {
    differenceInCalendarDays,
    format,
    isSameDay,
    isWithinInterval,
    addDays,
    startOfDay,
} from "date-fns";
import { toast } from "sonner";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Clock, Plus, X, Trash2 } from "lucide-react";

import { useVendorCalendar } from "@/hooks/queries/useVendorCalendar";
import { useDeleteCalendarBlock } from "@/hooks/queries/useDeleteCalendarBlock";
import { useBlockCalendarDates } from "@/hooks/queries/useBlockCalendarDates";

import { VendorBooking } from "@/types/vendor-booking";
import CalendarSkeleton from "@/components/skeleton/CalendarSkeleton";
import { VendorCalendarBlock } from "@/types/vendor-calendar";
import { useSaveBookingNotes } from "@/hooks/queries/useSaveBookingNotes";
import { useBookingDetails } from "@/hooks/queries/useBookingDetails";
import { useRouter } from "next/navigation";

interface CalendarEvent {
    uuid: string;
    title: string;
    date: string;
    time: string;
    location: string;
    type: "booked_by_me" | "booked_for_me";
    status: "upcoming" | "completed";
    notes?: string | null;
}

const isEventOver = (endDate: string) => {
    return new Date(endDate) < new Date();
};

export default function CalendarClient() {
    const router = useRouter();
    const { data, isLoading } = useVendorCalendar();
    const blockDates = useBlockCalendarDates();
    const deleteBlock = useDeleteCalendarBlock();
    const saveBookingNotes = useSaveBookingNotes();

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date()
    );

    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
        null
    );
    const [noteText, setNoteText] = useState("");
    const { data: bookingDetails } = useBookingDetails(selectedEvent?.uuid);

    // Date range blocking state
    const [blockStartDate, setBlockStartDate] = useState<Date | null>(null);
    const [blockEndDate, setBlockEndDate] = useState<Date | null>(null);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [blockReason, setBlockReason] = useState("");
    const [isBlockingMode, setIsBlockingMode] = useState(false);

    // Delete block state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedBlockToDelete, setSelectedBlockToDelete] =
        useState<VendorCalendarBlock | null>(null);


const events: CalendarEvent[] = useMemo(() => {
    if (!data) return [];

    const expandBooking = (
        booking: VendorBooking,
        type: "booked_by_me" | "booked_for_me"
    ): CalendarEvent[] => {
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);

        const days = differenceInCalendarDays(end, start) + 1;

        return Array.from({ length: days }).map((_, i) => {
            const date = addDays(start, i);

            return {
                uuid: booking.uuid,
                title: "Booking",
                date: format(date, "yyyy-MM-dd"),
                time:
                    booking.startTime && booking.endTime
                        ? `${booking.startTime} - ${booking.endTime}`
                        : "Full day",
                location: "—",
                type,
                status:
                    booking.status === "COMPLETED"
                        ? "completed"
                        : "upcoming",
                notes: booking.notes,
            };
        });
    };

    return [
        ...data.bookedForMe.flatMap((b) =>
            expandBooking(b, "booked_for_me")
        ),
        ...data.bookedByMe.flatMap((b) =>
            expandBooking(b, "booked_by_me")
        ),
    ];
}, [data]);

    const blockedRanges: VendorCalendarBlock[] = data?.blockedDates ?? [];

const isBlockedDate = (date: Date) => {
    const current = startOfDay(date);

    return blockedRanges.some((block) => {
        const start = startOfDay(new Date(block.startDate));
        const end = startOfDay(new Date(block.endDate));
        return current >= start && current <= end;
    });
};

const getBlockForDate = (date: Date): VendorCalendarBlock | null => {
    const current = startOfDay(date);

    return (
        blockedRanges.find((block) => {
            const start = startOfDay(new Date(block.startDate));
            const end = startOfDay(new Date(block.endDate));
            return current >= start && current <= end;
        }) ?? null
    );
};

    const hasEventOnDate = (date: Date) => {
        return events.some((event) => isSameDay(new Date(event.date), date));
    };

    const getDatesInRange = (start: Date, end: Date): Date[] => {
        const dates: Date[] = [];
        let current = new Date(start);
        const endDate = new Date(end);

        while (current <= endDate) {
            dates.push(new Date(current));
            current = addDays(current, 1);
        }

        return dates;
    };

    const handleDateClick = (date: Date) => {
        // If date is blocked, show delete option
        if (isBlockedDate(date)) {
            const block = getBlockForDate(date);
            if (block) {
                setSelectedBlockToDelete(block);
                setDeleteDialogOpen(true);
                setSelectedDate(date);
            }
            // Exit blocking mode if active
            if (isBlockingMode) {
                setIsBlockingMode(false);
                setBlockStartDate(null);
                setBlockEndDate(null);
            }
            return;
        }

        // If date has event, just show events in sidebar (not blocking mode)
        if (hasEventOnDate(date)) {
            setSelectedDate(date);
            // Exit blocking mode if in progress
            if (isBlockingMode) {
                setIsBlockingMode(false);
                setBlockStartDate(null);
                setBlockEndDate(null);
            }
            return;
        }

        // If not in blocking mode and no event, start blocking mode
        if (!isBlockingMode) {
            setIsBlockingMode(true);
            setBlockStartDate(date);
            setSelectedDate(date);
        }
        // If in blocking mode, set end date
        else if (!blockEndDate) {
            const start = blockStartDate! < date ? blockStartDate! : date;
            const end = blockStartDate! < date ? date : blockStartDate!;

            // Check if any date in range has events
            const datesInRange = getDatesInRange(start, end);
            const hasEventsInRange = datesInRange.some((d) =>
                hasEventOnDate(d)
            );

            if (hasEventsInRange) {
                toast.error("Cannot block date range containing events");
                setIsBlockingMode(false);
                setBlockStartDate(null);
                setSelectedDate(date);
                return;
            }

            setBlockStartDate(start);
            setBlockEndDate(end);
            setBlockDialogOpen(true);
        }
        // If both dates exist, reset and start new selection
        else {
            setIsBlockingMode(true);
            setBlockStartDate(date);
            setBlockEndDate(null);
            setSelectedDate(date);
        }
    };

    const handleBlockDatesSubmit = () => {
        if (!blockStartDate || !blockEndDate) return;

        const days = differenceInCalendarDays(blockEndDate, blockStartDate) + 1;

        if (days > 10) {
            toast.error("You can block a maximum of 10 days");
            return;
        }

        blockDates.mutate(
            {
                startDate: format(blockStartDate, "yyyy-MM-dd"),
                endDate: format(blockEndDate, "yyyy-MM-dd"),
                reason: blockReason,
            },
            {
                onSuccess: () => {
                    toast.success("Dates blocked successfully");
                    setBlockDialogOpen(false);
                    setIsBlockingMode(false);
                    setBlockStartDate(null);
                    setBlockEndDate(null);
                    setBlockReason("");
                },
                onError: (err) => {
                    toast.error(err.error || "Failed to block dates");
                },
            }
        );
    };

    const handleDeleteBlock = () => {
        if (!selectedBlockToDelete) return;

        deleteBlock.mutate(selectedBlockToDelete.uuid, {
            onSuccess: () => {
                toast.success("Blocked dates removed successfully");
                setDeleteDialogOpen(false);
                setSelectedBlockToDelete(null);
            },
            onError: (err: any) => {
                toast.error(err.error || "Failed to delete block");
            },
        });
    };

    const isInBlockingRange = (date: Date) => {
        if (!blockStartDate || !isBlockingMode) return false;
        if (!blockEndDate) return isSameDay(date, blockStartDate);

        return isWithinInterval(date, {
            start: blockStartDate,
            end: blockEndDate,
        });
    };

    const eventsForSelectedDate = selectedDate
        ? events.filter((e) => isSameDay(new Date(e.date), selectedDate))
        : [];

    const customDayContent = (day: Date) => {
        const dayEvents = events.filter((event) =>
            isSameDay(new Date(event.date), day)
        );

        const isToday = isSameDay(day, new Date());
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isBlocked = isBlockedDate(day);
        const isInRange = isInBlockingRange(day);



        return (
            <div
                className={`
                    relative w-full h-full min-h-[70px] sm:min-h-[90px]
                    p-1 sm:p-2 flex flex-col transition-colors
                    ${
                        isSelected && !isInRange
                            ? "bg-primary/10 border border-primary"
                            : ""
                    }
                    ${isToday && !isSelected && !isInRange ? "bg-accent" : ""}
                    ${
                        isBlocked
                            ? "bg-destructive/20 cursor-pointer hover:bg-destructive/30"
                            : ""
                    }
                    ${
                        isInRange && !isBlocked
                            ? "bg-orange-200 dark:bg-orange-900/30 border border-orange-400"
                            : ""
                    }
                `}
            >
                <div className="text-[9px] sm:text-xs font-medium mb-1">
                    {day.getDate()}
                </div>

                {isBlocked && (
                    <div className="text-[7px] sm:text-[9px] text-destructive font-medium">
                        Blocked
                    </div>
                )}

                {dayEvents.length > 0 && (
                    <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 3).map((event) => (
                            <div
                                key={event.uuid}
                                className={`
                                    text-[7px] sm:text-[9px] px-1 py-0.5 rounded line-clamp-1
                                    ${
                                        event.type === "booked_by_me"
                                            ? "bg-blue-500/20 text-blue-900 dark:text-blue-100 border-l-2 border-blue-600"
                                            : "bg-green-500/20 text-green-900 dark:text-green-100 border-l-2 border-green-600"
                                    }
                                `}
                            >
                                {event.title}
                            </div>
                        ))}
                        {dayEvents.length > 3 && (
                            <div className="text-[7px] sm:text-[9px] text-muted-foreground px-1">
                                +{dayEvents.length - 3} more
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

            useEffect(() => {
    if (eventsForSelectedDate.length > 0) {
        setSelectedEvent(eventsForSelectedDate[0]);
    } else {
        setSelectedEvent(null);
    }
}, [selectedDate, eventsForSelectedDate]);

    if (isLoading) return <CalendarSkeleton />;

    return (
        <>
            <main className="pt-8 px-4 md:px-8 pb-16">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">Event Calendar</h1>
                    <p className="text-muted-foreground mb-4">
                        Track your bookings and availability
                    </p>

                    {/* Color Legend */}
                    <div className="flex flex-wrap gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500/20 border-l-2 border-blue-600 rounded"></div>
                            <span>Booked by Me</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500/20 border-l-2 border-green-600 rounded"></div>
                            <span>Booked for Me</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-destructive/20 rounded"></div>
                            <span>Blocked Dates</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-200 dark:bg-orange-900/30 border border-orange-400 rounded"></div>
                            <span>Selecting Range</span>
                        </div>
                    </div>

                    {isBlockingMode && blockStartDate && !blockEndDate && (
                        <div className="mb-4 p-3 bg-primary/10 border border-primary rounded-lg flex items-center justify-between">
                            <span className="text-sm">
                                Select end date for blocking range (started:{" "}
                                {format(blockStartDate, "MMM d, yyyy")})
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setIsBlockingMode(false);
                                    setBlockStartDate(null);
                                    toast.info("Range selection cancelled");
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Calendar - Full Width */}
                        <Card className="lg:col-span-2 rounded-2xl">
                            <CardContent className="p-4">
                                <div className="w-full relative">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) =>
                                            date && handleDateClick(date)
                                        }
                                        className="w-full bg-white dark:bg-background"
                                        classNames={{
                                            months: "w-full",
                                            month: "w-full space-y-4",
                                            month_caption:
                                                "relative flex justify-center items-center h-10 mb-4",
                                            button_previous:
                                                "absolute left-0 top-0 z-10",
                                            button_next:
                                                "absolute right-0 top-0 z-10",
                                            month_grid:
                                                "w-full border-collapse",
                                            weekdays: "flex w-full",
                                            weekday:
                                                "text-muted-foreground w-full font-medium text-xs p-2 text-center border border-border",
                                            week: "flex w-full",
                                            day: "p-0 relative w-full",
                                            day_button: "h-full w-full p-0",
                                        }}
                                        components={{
                                            DayButton: ({
                                                day,
                                                modifiers,
                                                ...props
                                            }) => {
                                                const date = day.date;
                                                return (
                                                    <button
                                                        {...props}
                                                        className="h-full w-full cursor-pointer border border-border hover:bg-accent/50 transition-colors"
                                                        onClick={() =>
                                                            handleDateClick(
                                                                date
                                                            )
                                                        }
                                                    >
                                                        {customDayContent(date)}
                                                    </button>
                                                );
                                            },
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selected Day Sidebar */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">
                                {selectedDate
                                    ? format(selectedDate, "MMMM d, yyyy")
                                    : "Select a date"}
                            </h2>

{eventsForSelectedDate.map((event) => {
    const details = bookingDetails;

    const remainingAmount = Number(details?.payment.remainingAmount ?? 0);

    const isBooked = 
        !!details &&
        event.type === "booked_by_me" &&
        remainingAmount !== 0 &&
        isEventOver(details.booking.endDate) &&
        details.booking.status === "CONFIRMED";

    const canSettle =
        !!details &&
        event.type === "booked_by_me" &&
        remainingAmount > 0 &&
        isEventOver(details.booking.endDate) &&
        details.booking.status !== "COMPLETED";

    const isSettled =
        !!details &&
        event.type === "booked_by_me" &&
        remainingAmount === 0 &&
        isEventOver(details.booking.endDate) &&
        details.booking.status === "COMPLETED";

    return (
        <Card
            key={event.uuid}
            onClick={() => setSelectedEvent(event)}
            className={`border-l-4 ${
                event.type === "booked_by_me"
                    ? "border-blue-600"
                    : "border-green-600"
            }`}
        >
            <CardContent className="p-4 space-y-3">
                {/* Title + Status */}
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold">
                        {details?.product.title ?? "Booking"}
                    </h3>
                    <Badge variant="secondary" className="capitalize">
                        {event.status}
                    </Badge>
                </div>

                {/* Time */}
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {event.time}
                </div>

                {/* Party Info */}
                {details && (
                    <div className="text-sm space-y-1">
                        {event.type === "booked_for_me" ? (
                            <>
                                <p>
                                    <strong>Booked by:</strong>{" "}
                                    {details.requester.businessName}
                                </p>
                                <p>{details.requester.phone}</p>
                                <p>{details.requester.email}</p>
                            </>
                        ) : (
                            <>
                                <p>
                                    <strong>Service Provider:</strong>{" "}
                                    {details.provider.businessName}
                                </p>
                                <p>{details.provider.phone}</p>
                                <p>{details.provider.email}</p>
                            </>
                        )}
                    </div>
                )}

                {/* Payment Info */}
                {details && (
                    <div className="text-sm bg-muted/40 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between">
                            <span>Total</span>
                            <span>₹{details.payment.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Advance Paid</span>
                            <span className="text-green-600">
                                ₹{details.payment.advanceAmount}
                            </span>
                        </div>

                        <div className="flex justify-between font-semibold">
                            <span>Remaining</span>
                            {remainingAmount > 0 ? (
                                <span className="text-destructive">
                                    ₹{remainingAmount}
                                </span>
                            ) : (
                                <span className="text-green-600">
                                    No Remaining Due
                                </span>
                            )}
                        </div>

                    </div>
                )}

                {/* Notes */}
                {event.notes && (
                    <p className="text-sm bg-muted p-2 rounded">
                        {event.notes}
                    </p>
                )}

                {/* Notes CTA */}
                <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                        setSelectedEvent(event);
                        setNoteText(event.notes ?? "");
                        setNoteDialogOpen(true);
                    }}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Note
                </Button>

                {/* ✅ SETTLEMENT CTA */}
                {isBooked && (
     <Button
        className="w-full bg-gradient-primary"
        onClick={(e) => {
            e.stopPropagation(); // prevent card click
            router.push(
                `/vendor/bookings/confirmed/${event.uuid}`
            );
        }}
    >
        View Booking Summary
    </Button>
)}
                {canSettle && (
    <Button
        className="w-full bg-gradient-primary"
        onClick={(e) => {
            e.stopPropagation(); // prevent card click
            router.push(
                `/vendor/bookings/settle/${event.uuid}`
            );
        }}
    >
        Pay Remaining ₹{details.payment.remainingAmount}
    </Button>
)}

                {isSettled && (
    <Button
        className="w-full bg-gradient-primary"
        onClick={(e) => {
            e.stopPropagation(); // prevent card click
            router.push(
                `/vendor/bookings/completed/${event.uuid}`
            );
        }}
    >
        View Booking Summary
    </Button>
)}

            </CardContent>
        </Card>
    );
})}

                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Block Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete Blocked Dates
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to unblock dates from{" "}
                            {selectedBlockToDelete &&
                                format(
                                    new Date(selectedBlockToDelete.startDate),
                                    "MMM d, yyyy"
                                )}{" "}
                            to{" "}
                            {selectedBlockToDelete &&
                                format(
                                    new Date(selectedBlockToDelete.endDate),
                                    "MMM d, yyyy"
                                )}
                            ?
                            {selectedBlockToDelete?.reason && (
                                <span className="block mt-2 text-sm">
                                    Reason: {selectedBlockToDelete.reason}
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setSelectedBlockToDelete(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteBlock}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete Block
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Block Dates Dialog */}
            <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Block Dates</DialogTitle>
                        <DialogDescription>
                            Block dates from{" "}
                            {blockStartDate &&
                                format(blockStartDate, "MMM d, yyyy")}{" "}
                            to{" "}
                            {blockEndDate &&
                                format(blockEndDate, "MMM d, yyyy")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Reason (Optional)</Label>
                            <Textarea
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                placeholder="e.g., Vacation, Personal time off..."
                                className="min-h-[100px] mt-2"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setBlockDialogOpen(false);
                                    setIsBlockingMode(false);
                                    setBlockStartDate(null);
                                    setBlockEndDate(null);
                                    setBlockReason("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleBlockDatesSubmit} className="bg-gradient-primary">
                                Block Dates
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Notes Dialog */}
            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                        <DialogDescription>
                            Personal note for this booking
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Note</Label>
                            <Textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="min-h-[120px] mt-2"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setNoteDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-gradient-primary"
                                onClick={() => {
                                    if (!selectedEvent) return;

                                    saveBookingNotes.mutate(
                                        {
                                            bookingUuid: selectedEvent.uuid,
                                            notes: noteText, // "" allowed
                                        },
                                        {
                                            onSuccess: () => {
                                                toast.success("Notes saved");
                                                setNoteDialogOpen(false);
                                            },
                                            onError: (e) =>
                                                toast.error(e.message),
                                        }
                                    );
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
