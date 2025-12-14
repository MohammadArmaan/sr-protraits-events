import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { VendorProduct } from "@/types/vendor-product";

export function useFeaturedProducts() {
    return useQuery<VendorProduct[]>({
        queryKey: ["featured-products"],
        queryFn: async () => {
            const res = await axios.get("/api/vendors/products/featured-products");
            return res.data.products as VendorProduct[];
        },
        staleTime: 5 * 60 * 1000,
    });
}
