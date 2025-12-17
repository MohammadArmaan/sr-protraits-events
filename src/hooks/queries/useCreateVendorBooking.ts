import { useMutation } from "@tanstack/react-query";
import {
    CreateBookingRequest,
    CreateBookingResponse,
} from "@/types/vendor-booking";

export const useCreateVendorBooking = () => {
    return useMutation<CreateBookingResponse, Error, CreateBookingRequest>({
        mutationFn: async (payload) => {
            const res = await fetch("/api/vendors/bookings/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Failed to create booking");
            }

            return res.json() as Promise<CreateBookingResponse>;
        },
    });
};
