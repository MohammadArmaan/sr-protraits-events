// src/hooks/queries/useReviewBooking.ts
import { useQuery } from "@tanstack/react-query";
import { fetchVendorBookingId } from "@/lib/vendor/fetchVendorBookingId";

export function useReviewBooking(productUuid: string) {
    return useQuery({
        queryKey: ["review-booking", productUuid],
        queryFn: () => fetchVendorBookingId(productUuid),
        enabled: !!productUuid,
    });
}