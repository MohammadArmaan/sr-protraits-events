import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorBannerQueryKeys } from "./queryKeys";

export function useDeleteVendorBanner() {
    const queryClient = useQueryClient();

    return useMutation<{ success: true }, Error, number>({
        mutationFn: async (id) => {
            const { data } = await axios.delete<{ success: true }>(
                `/api/admin/vendor-banners/upload/${id}`,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: adminVendorBannerQueryKeys.all,
            });
        },
    });
}
