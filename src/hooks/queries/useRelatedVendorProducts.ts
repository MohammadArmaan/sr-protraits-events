import {
    RelatedVendorProductsResponse,
} from "@/types/vendor-product";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useRelatedVendorProducts(productUuid: string) {
    return useQuery<RelatedVendorProductsResponse>({
        queryKey: ["related-vendor-products", productUuid],
        queryFn: async () => {
            const { data } = await axios.get<RelatedVendorProductsResponse>(
                `/api/vendors/products/${productUuid}/related`
            );

            // ✅ return the full response object
            return data;
        },
        enabled: Boolean(productUuid),
        staleTime: 1000 * 60 * 5,
    });
}