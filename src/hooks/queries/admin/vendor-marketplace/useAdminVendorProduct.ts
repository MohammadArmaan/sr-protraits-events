import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { VendorProductResponse } from "@/types/admin/vendor-products";

export function useAdminVendorProduct(productId: number) {
    return useQuery({
        queryKey: ["admin-vendor-product", productId],
        queryFn: async () => {
            const res = await axios.get<VendorProductResponse>(
                `/api/admin/vendor-products/${productId}/details`,
                { withCredentials: true },
            );
            return res.data;
        },
        enabled: Number.isInteger(productId),
    });
}
