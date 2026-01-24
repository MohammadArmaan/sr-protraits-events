import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

interface ApproveProfileEditPayload {
    editId: number;
}

export function useApproveProfileEdit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            payload: ApproveProfileEditPayload
        ) => {
            try {
                await axios.post(
                    "/api/admin/profile-edits/approve",
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
