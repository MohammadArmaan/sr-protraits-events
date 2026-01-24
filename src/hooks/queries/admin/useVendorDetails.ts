import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { VendorDetailsResponse } from "@/types/admin/vendor-details";

export function useVendorDetails(vendorId: number) {
    return useQuery({
        queryKey: ["admin", "vendor-registration", "details", vendorId],
        queryFn: async () => {
            try {
                const res =
                    await axios.get<VendorDetailsResponse>(
                        `/api/admin/vendor-registration/${vendorId}`,
                        { withCredentials: true }
                    );

                return res.data;
            } catch (error) {
                throw new Error(getApiErrorMessage(error));
            }
        },
        enabled: !!vendorId,
    });
}
