// src/hooks/queries/admin/useRejectVendorRegistration.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

interface RejectVendorPayload {
    vendorId: number;
}

export function useRejectVendorRegistration() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: RejectVendorPayload) => {
            try {
                await axios.post(
                    "/api/admin/vendor-registration/reject",
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
