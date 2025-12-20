import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { VendorBankDetailsResponse } from "@/types/vendor-bank-details";

export function useVendorBankDetails() {
    return useQuery<VendorBankDetailsResponse>({
        queryKey: ["vendor-bank-details"],
        queryFn: async () => {
            const { data } = await axios.get<VendorBankDetailsResponse>(
                "/api/vendors/bank-details"
            );
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
}