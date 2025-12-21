// src/lib/fetchVendorBookingId.ts
import axios from "axios";

export async function fetchVendorBookingId(
    productUuid: string
): Promise<number | null> {
    try {
        const { data } = await axios.get<{
            bookingId: number | null;
        }>(
            `/api/vendors/products/${productUuid}/review-booking`,
            {
                withCredentials: true,
            }
        );

        return data.bookingId;
    } catch {
        return null;
    }
}