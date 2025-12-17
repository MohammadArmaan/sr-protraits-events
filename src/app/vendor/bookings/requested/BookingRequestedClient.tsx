"use client";

import { format } from "date-fns";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useBookingDecisionDetails } from "@/hooks/queries/useBookingDecisionDetails";
import { BookingDetailsSkeleton } from "@/components/skeleton/BookingDetailsSkeleton";

interface Props {
    uuid: string;
}

interface BookingResponse {
    booking: {
        uuid: string;
        status: string;
        bookingType: string;
        startDate: string;
        endDate: string;
        startTime?: string | null;
        endTime?: string | null;
        totalDays: number;
        finalAmount: string;

        product: {
            title: string;
        };

        vendor: {
            businessName: string;
            email: string;
        };
    };
}

export function BookingRequestedClient({ uuid }: Props) {
    const router = useRouter();

    const { data, isLoading, error } = useBookingDecisionDetails(uuid)

    if (isLoading) {
        return <BookingDetailsSkeleton />
    }

    if (error || !data?.booking) {
        return (
            <div className="pt-28 text-center text-destructive">
                Failed to load booking details
            </div>
        );
    }

    const { booking } = data;

    return (
        <main className="pt-28 px-4 pb-20">
            <div className="max-w-xl mx-auto">
                <Card className="rounded-2xl">
                    <CardContent className="p-6 space-y-6 text-center">
                        {/* Success Icon */}
                        <div className="flex justify-center">
                            <CheckCircle className="h-14 w-14 text-green-500" />
                        </div>

                        <h1 className="text-2xl font-bold">
                            Booking Request Sent Successfully 🎉
                        </h1>

                        <p className="text-muted-foreground">
                            Your request has been sent to{" "}
                            <span className="font-medium">
                                {booking.vendor.businessName}
                            </span>
                            . You will be notified once the vendor responds.
                        </p>

                        {/* Booking Summary */}
                        <div className="text-left bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Service</span>
                                <span className="font-medium">
                                    {booking.product.title}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Dates</span>
                                <span className="font-medium">
                                    {format(
                                        new Date(booking.startDate),
                                        "dd MMM yyyy"
                                    )}
                                    {booking.totalDays > 1 && (
                                        <>
                                            {" "}
                                            –{" "}
                                            {format(
                                                new Date(booking.endDate),
                                                "dd MMM yyyy"
                                            )}
                                        </>
                                    )}
                                </span>
                            </div>

                            {booking.startTime && booking.endTime && (
                                <div className="flex justify-between">
                                    <span>Time</span>
                                    <span className="font-medium">
                                        {booking.startTime} – {booking.endTime}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span>Total Days</span>
                                <span className="font-medium">
                                    {booking.totalDays}
                                </span>
                            </div>

                            <div className="flex justify-between border-t pt-2 font-semibold">
                                <span>Amount</span>
                                <span className="text-primary">
                                    ₹
                                    {Number(
                                        booking.finalAmount
                                    ).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Status</span>
                                <span>{booking.status}</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <Button
                            className="w-full bg-gradient-primary rounded-pill"
                            onClick={() => router.push("/vendor")}
                        >
                            Go to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
