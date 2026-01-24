import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { VendorRegistrationListResponse } from "@/types/admin/vendor-registration";

export function useAllVendorRegistrations() {
    return useQuery({
        queryKey: ["admin", "vendor-registration", "list", "ALL"],
        queryFn: async () => {
            try {
                const res = await axios.get<VendorRegistrationListResponse>(
                    "/api/admin/vendor-registration/list",
                    { withCredentials: true }
                );

                return res.data;
            } catch (error) {
                throw new Error(getApiErrorMessage(error));
            }
        },
    });
}
