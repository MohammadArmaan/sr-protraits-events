import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface EditBankDetailsPayload {
    accountHolderName: string;
    accountNumber: string;
    confirmAccountNumber: string;
    ifscCode: string;
    confirmed: boolean;
}

export function useEditBankDetails() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: EditBankDetailsPayload) => {
            const { data } = await axios.post(
                "/api/vendors/edit-bank-details",
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
