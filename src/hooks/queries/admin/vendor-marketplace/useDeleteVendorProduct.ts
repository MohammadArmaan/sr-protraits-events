import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorMarketplaceQueryKeys } from "./queryKeys";

export function useDeleteVendorProduct() {
    const queryClient = useQueryClient();

    return useMutation<{ success: true }, Error, number>({
        mutationFn: async (id) => {
            const { data } = await axios.delete<{ success: true }>(
                `/api/admin/vendor-products/${id}`,
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
