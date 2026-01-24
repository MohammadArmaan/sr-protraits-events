// src/hooks/queries/admin/useApproveVendorRegistration.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

interface ApproveVendorPayload {
    vendorId: number;
}

export function useApproveVendorRegistration() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: ApproveVendorPayload) => {
            try {
                await axios.post(
                    "/api/admin/vendor-registration/approve",
                    payload,
                    { withCredentials: true }
                );
            } catch (error) {
                throw new Error(getApiErrorMessage(error));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "vendor-registration"],
            });
        },
    });
}
