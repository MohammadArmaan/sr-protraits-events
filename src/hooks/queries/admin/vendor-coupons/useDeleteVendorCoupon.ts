// src/hooks/queries/admin/vendor-coupons/useDeleteVendorCoupon.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorCouponQueryKeys } from "./queryKeys";

export function useDeleteVendorCoupon() {
    const queryClient = useQueryClient();

    return useMutation<{ success: true }, Error, number>({
        mutationFn: async (id) => {
            const { data } = await axios.delete<{ success: true }>(
                `/api/admin/vendor-cupons/${id}`,
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: adminVendorCouponQueryKeys.all,
            });
        },
    });
}
