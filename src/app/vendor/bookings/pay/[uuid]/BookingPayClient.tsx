"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useBookingDecisionDetails } from "@/hooks/queries/useBookingDecisionDetails";
import { useCreateBookingPayment } from "@/hooks/queries/useCreateBookingPayment";
import { useVerifyBookingPayment } from "@/hooks/queries/useVerifyBookingPayment";
import {
    RazorpayOptions,
    RazorpaySuccessResponse,
} from "@/types/vendor-booking";
import { BookingPaymentSkeleton } from "@/components/skeleton/BookingPaymentSkeleton";
import { useQueryClient } from "@tanstack/react-query";

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

export function BookingPayClient({ uuid }: Props) {
    const router = useRouter();

    const { data, isLoading, error } = useBookingDecisionDetails(uuid);
    const createPayment = useCreateBookingPayment();
    const verifyPayment = useVerifyBookingPayment();
    const queryClient = useQueryClient();

    /* ----------------------------------
       Load Razorpay script
    ---------------------------------- */
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    /* ----------------------------------
       Guards
    ---------------------------------- */
    if (isLoading) return <BookingPaymentSkeleton />;

    if (error || !data) {
        return (
            <div className="pt-28 text-center text-destructive">
                Invalid booking
            </div>
        );
    }

    const { booking } = data;

    if (booking.status === "CONFIRMED") {
        router.push(`/vendor/bookings/confirmed/${uuid}`);
        return null;
    }

    if (booking.status !== "PAYMENT_PENDING") {
        return (
            <div className="pt-28 text-center text-muted-foreground">
                Payment is not available for this booking.
            </div>
        );
    }

    /* ----------------------------------
       Payment breakdown (UI only)
    ---------------------------------- */
    const totalAmount = Number(booking.finalAmount);
    const advanceAmount = Number(booking.advanceAmount);
    const remainingAmount = Number(booking.remainingAmount);

    /* ----------------------------------
       Payment handler
    ---------------------------------- */
    const handlePay = () => {
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
                        description: booking.product.title,
                        handler: (response: RazorpaySuccessResponse) => {
                            verifyPayment.mutate(response, {
                                onSuccess: async () => {
                                    toast.success(
                                        "Advance payment successful 🎉"
                                    );
                                    await queryClient.invalidateQueries({
                                        queryKey: ["booking-decision", uuid],
                                    });
                                    router.push(
                                        `/vendor/bookings/confirmed/${uuid}`
                                    );
                                },
                                onError: () => {
                                    toast.error("Payment verification failed");
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
                onError: (e) => {
                    toast.error(e.message);
                },
            }
        );
    };

    /* ----------------------------------
       UI
    ---------------------------------- */
    return (
        <main className="pt-28 px-4 pb-16">
            <div className="max-w-xl mx-auto">
                <Card className="rounded-2xl">
                    <CardContent className="p-6 space-y-6">
                        <h1 className="text-2xl font-bold">
                            Complete Advance Payment
                        </h1>

                        <div className="space-y-2 text-sm">
                            <p>
                                <strong>Vendor:</strong>{" "}
                                {booking.vendor.businessName}
                            </p>
                            <p>
                                <strong>Service:</strong>{" "}
                                {booking.product.title}
                            </p>

                            <div className="border-t pt-2 space-y-1">
                                <p>
                                    <strong>Total Amount:</strong> ₹
                                    {totalAmount.toLocaleString()}
                                </p>
                                <p className="text-green-600 font-semibold">
                                    Advance Payable Now: ₹
                                    {advanceAmount.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Remaining ₹
                                    {remainingAmount.toLocaleString()} to be
                                    paid after event completion
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handlePay}
                            disabled={
                                createPayment.isPending ||
                                verifyPayment.isPending
                            }
                            className="w-full bg-gradient-primary rounded-pill"
                        >
                            {createPayment.isPending
                                ? "Initializing Payment…"
                                : "Pay Advance"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
