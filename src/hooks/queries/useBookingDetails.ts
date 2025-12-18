// src/hooks/queries/useBookingDetails.ts
import { BookingDetailsResponse } from "@/types/vendor-booking";
import { useQuery } from "@tanstack/react-query";

export const useBookingDetails = (bookingUuid?: string) => {
    return useQuery<BookingDetailsResponse>({
        queryKey: ["booking-details", bookingUuid],
        queryFn: async () => {
            const res = await fetch(
                `/api/vendors/bookings/${bookingUuid}/details`
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to fetch booking details");
            }

            return res.json();
        },
        enabled: !!bookingUuid, // 🔑 lazy fetch
    });
};
