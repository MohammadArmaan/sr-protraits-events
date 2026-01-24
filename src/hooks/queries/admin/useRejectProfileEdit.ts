import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

interface RejectProfileEditPayload {
    editId: number;
}

export function useRejectProfileEdit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            payload: RejectProfileEditPayload
        ) => {
            try {
                await axios.post(
                    "/api/admin/profile-edits/reject",
                    payload,
                    { withCredentials: true }
                );
            } catch (error) {
                throw new Error(getApiErrorMessage(error));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "profile-edits"],
            });
        },
    });
}
