import { ActiveBookingTypes } from "@/types/vendor-booking";
import { useQuery } from "@tanstack/react-query";

export const useActiveBookingStatus = (
    vendorProductId: number,
    requesterVendorId: number
) => {
    return useQuery<ActiveBookingTypes>({
        queryKey: [
            "active-booking",
            vendorProductId,
            requesterVendorId,
        ],
        queryFn: async (): Promise<ActiveBookingTypes> => {
            const res = await fetch(
                `/api/vendors/bookings/active?` +
                `vendorProductId=${vendorProductId}` +
                `&requesterVendorId=${requesterVendorId}`
            );

            if (!res.ok) {
                throw new Error("Failed to check booking status");
            }

            return res.json();
        },
        enabled: !!vendorProductId && !!requesterVendorId,
    });
};
