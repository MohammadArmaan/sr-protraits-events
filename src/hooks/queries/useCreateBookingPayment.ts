import { useMutation } from "@tanstack/react-query";
import { RazorpayOrderResponse } from "@/types/vendor-booking";

export const useCreateBookingPayment = () => {
    return useMutation<RazorpayOrderResponse, Error, { uuid: string }>({
        mutationFn: async ({ uuid }) => {
            const res = await fetch(`/api/vendors/bookings/${uuid}/pay`, {
                method: "POST",
            });

            if (!res.ok) {
                throw new Error("Failed to create payment order");
            }

            return res.json() as Promise<RazorpayOrderResponse>;
        },
    });
};
