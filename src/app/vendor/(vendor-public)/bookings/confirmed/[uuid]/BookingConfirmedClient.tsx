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
import { useDownloadBookingInvoice } from "@/hooks/queries/useDownloadBookingInvoice";
import { toast } from "sonner";

interface Props {
    uuid: string;
}

export function BookingConfirmedClient({ uuid }: Props) {
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

    // HARD SAFETY CHECK
    if (booking.status !== "CONFIRMED") {
        return (
            <div className="pt-28 text-center text-muted-foreground">
                This booking is not confirmed yet.
            </div>
        );
    }

    /* ----------------------------------
       Payment breakdown (UI only)
    ---------------------------------- */
    const totalAmount = Number(booking.finalAmount);
    const advanceAmount = Number(booking.advanceAmount);
    const remainingAmount = Number(booking.remainingAmount);

    return (
        <main className="pt-28 px-4 md:px-8 pb-16">
            <div className="max-w-2xl mx-auto">
                {/* SUCCESS HEADER */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-16 w-16 text-success" />
                    </div>

                    <h1 className="text-4xl font-bold mb-2">
                        Booking Confirmed!
                    </h1>

                    <p className="text-muted-foreground text-lg">
                        Advance payment successful. Your vendor has been
                        notified.
                    </p>
                </div>

                {/* BOOKING SUMMARY */}
                <Card className="rounded-2xl shadow-lg mb-6">
                    <CardContent className="p-8 space-y-6">
                        <h2 className="text-2xl font-semibold">
                            Booking Summary
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
                                        {booking.startTime} – {booking.endTime}
                                    </span>
                                </div>
                            )}

                            {/* PAYMENT BREAKDOWN */}
                            <div className="pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Total Contract Amount
                                    </span>
                                    <span className="font-medium">
                                        ₹{totalAmount.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex justify-between text-success font-semibold">
                                    <span className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Advance Paid
                                    </span>
                                    <span>
                                        ₹{advanceAmount.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex justify-between text-destructive">
                                    <span>Remaining Amount</span>
                                    <span>
                                        ₹{remainingAmount.toLocaleString()}
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    Remaining amount to be paid after event
                                    completion.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* NEXT STEPS */}
                <Card className="rounded-xl mb-6 bg-muted/40">
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">What’s Next?</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>• Advance payment recorded</li>
                            <li>• Vendor will contact you shortly</li>
                            <li>• Final payment after event completion</li>
                        </ul>
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
                        className="flex-1 rounded-pill bg-accent text-black hover:bg-accent/80"
                        disabled={downloadInvoice.isPending}
                        onClick={() =>
                            downloadInvoice.mutate(uuid, {
                                onError: () =>
                                    toast.error("Failed to download invoice"),
                            })
                        }
                    >
                        {downloadInvoice.isPending ? (
                            "Preparing Invoice…"
                        ) : (
                            <>
                                <FileDown className="h-4 w-4 mr-2" />
                                Download Invoice
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </main>
    );
}
