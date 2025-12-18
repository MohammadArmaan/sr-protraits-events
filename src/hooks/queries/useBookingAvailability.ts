import { AvailabilityResponse } from "@/types/vendor-booking";
import { useQuery } from "@tanstack/react-query";

export const useBookingAvailability = (vendorProductId: number) => {
    return useQuery<AvailabilityResponse>({
        queryKey: ["booking-availability", vendorProductId],
        queryFn: async () => {
            const res = await fetch(
                `/api/vendors/bookings/availability?vendorProductId=${vendorProductId}`
            );

            if (!res.ok) {
                throw new Error("Failed to fetch availability");
            }

            return res.json();
        },
        enabled: !!vendorProductId,
        staleTime: 5 * 60 * 1000,
        retry: 2,
        placeholderData: { unavailableRanges: [] },
    });
};
