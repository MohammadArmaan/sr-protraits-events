// useShopSubCategories.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface ShopSubCategory {
    id: number;
    name: string;
    slug: string;
    categoryId: number;
}


export function useShopSubCategories(categoryId?: string) {
  return useQuery<ShopSubCategory[]>({
    queryKey: ["shop-subcategories", categoryId],
    queryFn: async () => {
      const res = await axios.get(
        `/api/admin/vendor-sub-categories?categoryId=${categoryId}`
      );
      return res.data;
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}
