import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorMarketplaceQueryKeys } from "./queryKeys";
import { UpdateVendorProductPayload, VendorProductResponse } from "@/types/admin/vendor-products";

interface UpdateVendorProductInput {
    id: number;
    payload: UpdateVendorProductPayload;
}

export function useUpdateVendorProduct() {
    const queryClient = useQueryClient();

    return useMutation<VendorProductResponse, Error, UpdateVendorProductInput>({
        mutationFn: async ({ id, payload }) => {
            const { data } = await axios.put<VendorProductResponse>(
                `/api/admin/vendor-products/${id}`,
                payload,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: adminVendorMarketplaceQueryKeys.all,
            });
        },
    });
}
