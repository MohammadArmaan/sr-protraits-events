import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorMarketplaceQueryKeys } from "./queryKeys";
import { VendorProductResponse } from "@/types/admin/vendor-products";

export function useAdminVendorProduct(productId: number) {
    return useQuery<VendorProductResponse>({
        queryKey: adminVendorMarketplaceQueryKeys.detail(productId),
        queryFn: async () => {
            const { data } = await axios.get<VendorProductResponse>(
                `/api/admin/vendor-products/${productId}`,
            );
            return data;
        },
        enabled: Number.isFinite(productId),
    });
}
