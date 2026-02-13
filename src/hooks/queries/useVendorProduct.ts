import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { ImagesByCatalog, VendorProduct } from "@/types/vendor-product";

interface ProductResponse {
    product: VendorProduct;
    imagesByCatalog: ImagesByCatalog;
}


export function useVendorProduct(uuid: string) {
    return useQuery<VendorProduct>({
        queryKey: ["vendor-product", uuid],
        enabled: Boolean(uuid),
        queryFn: async () => {
            const res = await axios.get<ProductResponse>(
                `/api/vendors/products/${uuid}`
            );

            return {
                ...res.data.product,
                imagesByCatalog: res.data.imagesByCatalog,
            };
        },
        staleTime: 5 * 60 * 1000,
    });
}
