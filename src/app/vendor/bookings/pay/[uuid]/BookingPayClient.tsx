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
    if (isLoading) {
        return <BookingPaymentSkeleton />;
    }

    if (error || !data) {
        return (
            <div className="pt-28 text-center text-destructive">
                Invalid booking
            </div>
        );
    }

    const { booking } = data;

    if (booking.status === "CONFIRMED") {
        router.push(`vendor/bookings/confirmed/${uuid}`);
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
                                onSuccess: () => {
                                    toast.success("Payment successful 🎉");
                                    router.push(
                                        `vendor/bookings/confirmed/${uuid}`
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
                        <h1 className="text-2xl font-bold">Complete Payment</h1>

                        <div className="space-y-2 text-sm">
                            <p>
                                <strong>Vendor:</strong>{" "}
                                {booking.vendor.businessName}
                            </p>
                            <p>
                                <strong>Service:</strong>{" "}
                                {booking.product.title}
                            </p>
                            <p>
                                <strong>Amount:</strong> ₹
                                {Number(booking.finalAmount).toLocaleString()}
                            </p>
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
                                : "Pay Now"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
