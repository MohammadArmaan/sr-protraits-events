// src/hooks/queries/useSaveBookingNotes.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SaveBookingNotesPayload {
    bookingUuid: string;
    notes: string; // can be ""
}

export const useSaveBookingNotes = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, SaveBookingNotesPayload>({
        mutationFn: async ({ bookingUuid, notes }) => {
            const res = await fetch(
                `/api/vendors/bookings/${bookingUuid}/notes`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ notes }),
                }
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save notes");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["vendor-calendar"],
            });
            queryClient.invalidateQueries({
                queryKey: ["vendor-bookings"],
            });
        },
    });
};
