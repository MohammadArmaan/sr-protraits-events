import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface AddBankDetailsPayload {
    accountHolderName: string;
    accountNumber: string;
    confirmAccountNumber: string;
    ifscCode: string;
    confirmed: boolean;
}

export function useAddBankDetails() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: AddBankDetailsPayload) => {
            const { data } = await axios.post(
                "/api/vendors/bank-details",
                payload
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["vendor-bank-details"],
            });
        },
    });
}
