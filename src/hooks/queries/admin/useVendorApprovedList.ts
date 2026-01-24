// src/hooks/queries/admin/useVendorApprovalList.ts
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { VendorRegistrationListResponse } from "@/types/admin/vendor-registration";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useVendorApprovedList() {
    return useQuery({
        queryKey: ["admin", "vendor-registration", "approved-list"],
        queryFn: async () => {
            try {
                const res = await axios.get<VendorRegistrationListResponse>(
                    "/api/admin/vendor-registration/approved-list",
                    { withCredentials: true },
                );
                return res.data;
            } catch (error) {
                throw new Error(getApiErrorMessage(error));
            }
        },
    });
}
