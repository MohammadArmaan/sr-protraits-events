"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { CheckCircle2, Calendar, Clock, CreditCard, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useBookingDecisionDetails } from "@/hooks/queries/useBookingDecisionDetails";
import { BookingConfirmedSkeleton } from "@/components/skeleton/BookingConfirmedSkeleton";

interface Props {
    uuid: string;
}

export function BookingConfirmedClient({ uuid }: Props) {
    const router = useRouter();
    const { data, isLoading, error } = useBookingDecisionDetails(uuid);

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
                        Payment successful. Your vendor has been notified.
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

                            <div className="flex justify-between pt-3">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <CreditCard className="h-4 w-4" />
                                    Amount Paid
                                </span>
                                <span className="text-2xl font-bold text-success">
                                    ₹
                                    {Number(
                                        booking.finalAmount
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* NEXT STEPS */}
                <Card className="rounded-xl mb-6 bg-muted/40">
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">What’s Next?</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>• Confirmation email has been sent</li>
                            <li>• Vendor will contact you shortly</li>
                            <li>• Invoice is attached in your email</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* CTA */}
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-pill"
                        onClick={() => router.push("/vendor")}
                    >
                        Back to Home
                    </Button>

                    <Button
                        className="flex-1 rounded-pill bg-gradient-primary"
                        onClick={() => router.push("/vendor/calendar")}
                    >
                        View Calendar
                    </Button>
                </div>
            </div>
        </main>
    );
}
