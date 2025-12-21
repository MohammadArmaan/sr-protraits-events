"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    Calendar,
    Clock,
    CreditCard,
    FileDown,
    Home,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useBookingDecisionDetails } from "@/hooks/queries/useBookingDecisionDetails";
import { BookingConfirmedSkeleton } from "@/components/skeleton/BookingConfirmedSkeleton";
import { toast } from "sonner";
import { useDownloadBookingInvoice } from "@/hooks/queries/useDownloadBookingInvoice";

interface Props {
    uuid: string;
}

export function CompletedClient({ uuid }: Props) {
    const router = useRouter();
    const { data, isLoading, error } = useBookingDecisionDetails(uuid);
    const downloadInvoice = useDownloadBookingInvoice();

    if (isLoading) return <BookingConfirmedSkeleton />;

    if (error || !data) {
        return (
            <div className="pt-28 text-center text-destructive">
                Booking not found
            </div>
        );
    }

    const { booking } = data;

    /* HARD SAFETY */
    if (booking.status !== "COMPLETED") {
        return (
            <div className="pt-28 text-center text-muted-foreground">
                Settlement not completed yet.
            </div>
        );
    }

    const totalAmount = Number(booking.finalAmount);
    const advanceAmount = Number(booking.advanceAmount);
    const remainingAmount = totalAmount - advanceAmount;

    return (
        <main className="pt-28 px-4 md:px-8 pb-16">
            <div className="max-w-2xl mx-auto">
                {/* SUCCESS HEADER */}
                <div className="text-center mb-10">
                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-16 w-16 text-green-600" />
                    </div>

                    <h1 className="text-4xl font-bold mb-2">
                        Payment Complete 🎉
                    </h1>

                    <p className="text-muted-foreground text-lg">
                        Your booking has been successfully settled.
                    </p>
                </div>

                {/* SUMMARY */}
                <Card className="rounded-2xl shadow-lg mb-6">
                    <CardContent className="p-8 space-y-6">
                        <h2 className="text-2xl font-semibold">
                            Settlement Summary
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-3">
                                <span className="text-muted-foreground">
                                    Vendor
                                </span>
                                <span className="font-medium">
                                    {booking.vendor.businessName}
                                </span>
                            </div>

                            <div className="flex justify-between border-b pb-3">
                                <span className="text-muted-foreground">
                                    Service
                                </span>
                                <span className="font-medium">
                                    {booking.product.title}
                                </span>
                            </div>

                            <div className="flex justify-between border-b pb-3">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Date
                                </span>
                                <span className="font-medium">
                                    {format(
                                        new Date(booking.startDate),
                                        "dd MMM yyyy"
                                    )}
                                    {booking.bookingType === "MULTI_DAY" &&
                                        ` – ${format(
                                            new Date(booking.endDate),
                                            "dd MMM yyyy"
                                        )}`}
                                </span>
                            </div>

                            {booking.startTime && booking.endTime && (
                                <div className="flex justify-between border-b pb-3">
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        Time
                                    </span>
                                    <span className="font-medium">
                                        {booking.startTime} –{" "}
                                        {booking.endTime}
                                    </span>
                                </div>
                            )}

                            {/* PAYMENT */}
                            <div className="pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Total Amount
                                    </span>
                                    <span className="font-medium">
                                        ₹{totalAmount.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex justify-between text-green-600">
                                    <span className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Advance Paid
                                    </span>
                                    <span>
                                        ₹{advanceAmount.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex justify-between text-green-600 font-semibold">
                                    <span>Remaining Paid</span>
                                    <span>
                                        ₹{remainingAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-pill"
                        onClick={() => router.push("/vendor")}
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>

                    <Button
                        className="flex-1 rounded-pill bg-gradient-primary"
                        onClick={() => router.push("/vendor/calendar")}
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        View Calendar
                    </Button>

                    <Button
                        className="flex-1 rounded-pill bg-accent hover:bg-accent/80 text-black"
                        disabled={downloadInvoice.isPending}
                        onClick={() =>
                            downloadInvoice.mutate(uuid, {
                                onError: () =>
                                    toast.error(
                                        "Failed to download invoice"
                                    ),
                            })
                        }
                    >
                        <FileDown className="h-4 w-4 mr-2" />
                        Download Invoice
                    </Button>
                </div>
            </div>
        </main>
    );
}
