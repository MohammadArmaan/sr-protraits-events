// src/hooks/mutations/useBlockCalendarDates.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface BlockCalendarPayload {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    reason?: string;
}

interface BlockCalendarResponse {
    success: true;
}

interface ErrorResponse {
    error: string;
}

export const useBlockCalendarDates = () => {
    const queryClient = useQueryClient();

    return useMutation<
        BlockCalendarResponse,
        ErrorResponse,
        BlockCalendarPayload
    >({
        mutationFn: async (payload) => {
            const res = await axios.post<BlockCalendarResponse>(
                "/api/vendors/calendar/block",
                payload,
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
