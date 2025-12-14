// src/hooks/queries/useVendorShopProducts.ts
import { VendorProduct } from "@/types/vendor-product";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";

export interface ShopMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface ShopResponse {
    products: VendorProduct[];
    meta: ShopMeta;
}

export function useVendorShopProducts(params: URLSearchParams) {
    return useQuery<ShopResponse>({
        queryKey: ["shop-products", params.toString()],
        queryFn: async () => {
            const res = await axios.get(
                `/api/vendors/products?${params.toString()}`
            );
            return res.data;
        },
        placeholderData: keepPreviousData,
        staleTime: 60 * 1000,
    });
}
