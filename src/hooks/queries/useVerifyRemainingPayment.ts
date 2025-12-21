import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

interface VerifyRemainingPaymentPayload {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface VerifyRemainingPaymentResponse {
    success: true;
}

interface ApiError {
    error: string;
}

export function useVerifyRemainingPayment() {
    return useMutation<
        VerifyRemainingPaymentResponse,
        AxiosError<ApiError>,
        VerifyRemainingPaymentPayload
    >({
        mutationFn: async (payload) => {
            const { data } = await axios.post<VerifyRemainingPaymentResponse>(
                "/api/vendors/bookings/payment/verify-remaining",
                payload
            );
            return data;
        },
    });
}
