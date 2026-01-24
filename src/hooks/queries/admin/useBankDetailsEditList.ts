import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import {
    VendorBankDetailsEditRequest,
} from "@/types/admin/vendor-bank-details";

interface RawBankEditResponse {
    pending: VendorBankDetailsEditRequest[];
}

export function useBankDetailsEditList() {
    return useQuery({
        queryKey: ["admin", "vendor-bank-details", "list"],
        queryFn: async () => {
            try {
                const res =
                    await axios.get<RawBankEditResponse>(
                        "/api/admin/vendor-bank-details/list",
                        { withCredentials: true }
                    );

                // 🔑 Normalize backend response
                return {
                    vendors: res.data.pending,
                };
            } catch (error) {
                throw new Error(getApiErrorMessage(error));
            }
        },
    });
}
