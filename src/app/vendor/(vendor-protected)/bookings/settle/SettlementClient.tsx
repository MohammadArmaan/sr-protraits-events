"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useBookingDecisionDetails } from "@/hooks/queries/useBookingDecisionDetails";
import { useCreateRemainingPayment } from "@/hooks/queries/useCreateRemainingPayment";
import { useVerifyRemainingPayment } from "@/hooks/queries/useVerifyRemainingPayment";

import {
    RazorpayOptions,
    RazorpaySuccessResponse,
} from "@/types/vendor-booking";

import { BookingPaymentSkeleton } from "@/components/skeleton/BookingPaymentSkeleton";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            open: () => void;
        };
    }
}

interface Props {
    uuid: string;
}

export function SettlementClient({ uuid }: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data, isLoading } = useBookingDecisionDetails(uuid);
    const createPayment = useCreateRemainingPayment();
    const verifyPayment = useVerifyRemainingPayment();

    /* Load Razorpay */
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    if (isLoading) return <BookingPaymentSkeleton />;

    if (!data) {
        return (
            <div className="pt-28 text-center text-destructive">
                Booking not found
            </div>
        );
    }

    const { booking } = data;

    const remainingAmount = Number(booking.remainingAmount);

    /* HARD GUARD */
    if (remainingAmount <= 0) {
        router.replace(`/vendor/bookings/completed/${uuid}`);
        return null;
    }

    /* ----------------------------------
       PAY REMAINING
    ---------------------------------- */
    const handlePayRemaining = () => {
        createPayment.mutate(
            { uuid },
            {
                onSuccess: ({ key, orderId, amount, currency }) => {
                    const options: RazorpayOptions = {
                        key,
                        amount,
                        currency,
                        order_id: orderId,
                        name: booking.vendor.businessName,
                        description: `Remaining payment – ${booking.product.title}`,
                        handler: (response: RazorpaySuccessResponse) => {
                            verifyPayment.mutate(response, {
                                onSuccess: async () => {
                                    toast.success(
                                        "Remaining payment completed 🎉",
                                    );

                                    await queryClient.invalidateQueries({
                                        queryKey: ["booking-decision", uuid],
                                    });

                                    router.replace(
                                        `/vendor/bookings/completed/${uuid}`,
                                    );
                                },
                                onError: (err) => {
                                    toast.error(
                                        err.response?.data?.error ??
                                            "Payment verification failed",
                                    );
                                },
                            });
                        },
                        theme: {
                            color: "#6366f1",
                        },
                    };

                    const razorpay = new window.Razorpay(options);
                    razorpay.open();
                },
                onError: (err) => {
                    toast.error(
                        getApiErrorMessage(err) ?? "Unable to initiate payment",
                    );
                },
            },
        );
    };

    return (
        <main className="pt-28 px-4 pb-16">
            <div className="max-w-xl mx-auto">
                <Card className="rounded-2xl">
                    <CardContent className="p-6 space-y-6">
                        <h1 className="text-2xl font-bold">
                            Complete Remaining Payment
                        </h1>

                        <div className="text-sm space-y-2">
                            <p>
                                <strong>Vendor:</strong>{" "}
                                {booking.vendor?.businessName ||
                                    booking.vendor.fullName}
                            </p>
                            <p>
                                <strong>Service:</strong>{" "}
                                {booking.product.title}
                            </p>
                            <p>
                                <strong>Event Location:</strong>{" "}
                                {booking.eventLocation}
                            </p>

                            <div className="mt-2 rounded-xl overflow-hidden border">
                                <iframe
                                    width="100%"
                                    height="200"
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                                        booking.eventLocation,
                                    )}&output=embed`}
                                />
                            </div>

                            <div className="border-t pt-3">
                                <p className="font-semibold text-destructive">
                                    Remaining Amount: ₹
                                    {remainingAmount.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    This payment completes your booking.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handlePayRemaining}
                            disabled={
                                createPayment.isPending ||
                                verifyPayment.isPending
                            }
                            className="w-full rounded-pill bg-gradient-primary"
                        >
                            {createPayment.isPending
                                ? "Initializing Payment…"
                                : "Pay Remaining Amount"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
