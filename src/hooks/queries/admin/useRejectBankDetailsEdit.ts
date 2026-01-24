import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

interface RejectBankDetailsPayload {
    vendorId: number;
}

export function useRejectBankDetailsEdit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: RejectBankDetailsPayload) => {
            try {
                await axios.post(
                    "/api/admin/vendor-bank-details/reject",
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
