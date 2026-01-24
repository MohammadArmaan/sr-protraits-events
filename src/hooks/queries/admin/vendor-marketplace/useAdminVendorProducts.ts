import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorMarketplaceQueryKeys } from "./queryKeys";
import { VendorProductListResponse } from "@/types/admin/vendor-products";

export function useAdminVendorProducts() {
    return useQuery<VendorProductListResponse>({
        queryKey: adminVendorMarketplaceQueryKeys.all,
        queryFn: async () => {
            const { data } = await axios.get<VendorProductListResponse>(
                "/api/admin/vendor-products/list",
            );
            return data;
        },
        staleTime: 0,
        refetchOnMount: "always",
    });
}
