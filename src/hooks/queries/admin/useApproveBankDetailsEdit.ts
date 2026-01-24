import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

interface ApproveBankDetailsPayload {
    vendorId: number;
}

export function useApproveBankDetailsEdit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: ApproveBankDetailsPayload) => {
            try {
                await axios.post(
                    "/api/admin/vendor-bank-details/approve",
                    payload,
                    { withCredentials: true }
                );
            } catch (error) {
                throw new Error(getApiErrorMessage(error));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "vendor-bank-details"],
            });
        },
    });
}
