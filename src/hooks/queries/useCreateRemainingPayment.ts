import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface CreateRemainingPaymentResponse {
    key: string;
    orderId: string;
    amount: number;
    currency: string;
}

export function useCreateRemainingPayment() {
    return useMutation({
        mutationFn: async ({ uuid }: { uuid: string }) => {
            const { data } = await axios.post<CreateRemainingPaymentResponse>(
                `/api/vendors/bookings/${uuid}/pay-remaining`
            );
            return data;
        },
    });
}
