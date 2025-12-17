import { useQuery } from "@tanstack/react-query";
import { BookingDecisionDetails } from "@/types/vendor-booking";

export const useBookingDecisionDetails = (uuid: string) => {
    return useQuery<BookingDecisionDetails>({
        queryKey: ["booking-decision", uuid],
        queryFn: async () => {
            const res = await fetch(`/api/vendors/bookings/${uuid}`);
            if (!res.ok) throw new Error("Failed to load booking");
            return res.json();
        },
        enabled: !!uuid,
    });
};
