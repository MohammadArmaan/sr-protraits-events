import { useMutation } from "@tanstack/react-query";
import {
    VerifyPaymentRequest,
    VerifyPaymentResponse,
} from "@/types/vendor-booking";

export const useVerifyBookingPayment = () => {
    return useMutation<VerifyPaymentResponse, Error, VerifyPaymentRequest>({
        mutationFn: async (payload) => {
            const res = await fetch("/api/vendors/bookings/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Payment verification failed");
            }

            return res.json() as Promise<VerifyPaymentResponse>;
        },
    });
};
