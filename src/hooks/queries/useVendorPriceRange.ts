// src/hooks/queries/useVendorPriceRange.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface PriceRange {
    minPrice: number;
    maxPrice: number;
}

export function useVendorPriceRange() {
    return useQuery<PriceRange>({
        queryKey: ["vendor-price-range"],
        queryFn: async () => {
            const res = await axios.get(
                "/api/vendors/products/price-range"
            );
            return res.data;
        },
        staleTime: 10 * 60 * 1000,
    });
}
