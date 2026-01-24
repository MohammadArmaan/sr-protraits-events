// src/hooks/queries/admin/useVendorApprovalList.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { VendorRegistrationListResponse } from "@/types/admin/vendor-registration";

export function useVendorApprovalList() {
    return useQuery({
        queryKey: ["admin", "vendor-registration", "approval-list"],
        queryFn: async () => {
            try {
                const res = await axios.get<VendorRegistrationListResponse>(
                    "/api/admin/vendor-registration/approval-list",
                    { withCredentials: true },
                );
                return res.data;
            } catch (error) {
                throw new Error(getApiErrorMessage(error));
            }
        },
    });
}
