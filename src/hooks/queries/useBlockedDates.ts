import { useQuery } from "@tanstack/react-query";
import { BlockedDatesResponse } from "@/types/vendor-booking";

export const useBlockedDates = (vendorId: number) => {
    return useQuery<BlockedDatesResponse, Error>({
        queryKey: ["blocked-dates", vendorId],
        queryFn: async () => {
            const res = await fetch(
                `/api/vendors/bookings/blocked-dates?vendorId=${vendorId}`
            );

            if (!res.ok) {
                throw new Error("Failed to fetch blocked dates");
            }

            return res.json() as Promise<BlockedDatesResponse>;
        },
        enabled: !!vendorId,
        staleTime: 5 * 60 * 1000, // 5 minutes - reduces unnecessary refetches
        retry: 2, // Retry failed requests twice
        retryDelay: 1000, // Wait 1 second between retries
        // Return empty blocked array on error so the component can still render
        placeholderData: { blocked: [] },
    });
};