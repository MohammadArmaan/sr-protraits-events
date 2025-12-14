// src/hooks/queries/useVendorCategories.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useVendorCategories() {
    return useQuery<string[]>({
        queryKey: ["vendor-categories"],
        queryFn: async () => {
            const res = await axios.get("/api/vendors/products/categories");
            return res.data.categories;
        },
        staleTime: 10 * 60 * 1000,
    });
}
