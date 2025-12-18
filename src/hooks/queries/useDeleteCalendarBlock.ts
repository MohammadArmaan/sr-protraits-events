// src/hooks/mutations/useDeleteCalendarBlock.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface DeleteBlockResponse {
    success: true;
}

interface ErrorResponse {
    error: string;
}

export const useDeleteCalendarBlock = () => {
    const queryClient = useQueryClient();

    return useMutation<
        DeleteBlockResponse,
        ErrorResponse,
        string // uuid
    >({
        mutationFn: async (uuid) => {
            const res = await axios.delete<DeleteBlockResponse>(
                `/api/vendors/calendar/block/${uuid}`,
                { withCredentials: true }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["vendor-calendar"],
            });
        },
    });
};
