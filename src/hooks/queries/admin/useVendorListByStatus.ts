// src/hooks/queries/admin/useVendorListByStatus.ts
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import {
    VendorRegistrationListResponse,
    VendorRegistrationStatus,
} from "@/types/admin/vendor-registration";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useVendorListByStatus(status: VendorRegistrationStatus) {
    return useQuery({
        queryKey: ["admin", "vendor-registration", "list", status],
        queryFn: async () => {
            try {
                const res = await axios.get<VendorRegistrationListResponse>(
                    `/api/admin/vendor-registration/list/${status}`,
                    { withCredentials: true },
                );
                return res.data;
            } catch (error) {
                throw new Error(getApiErrorMessage(error));
            }
        },
        enabled: Boolean(status),
    });
}
