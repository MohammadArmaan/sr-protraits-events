// src/hooks/queries/admin/vendor-coupons/useUpdateVendorCoupon.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorCouponQueryKeys } from "./queryKeys";
import {
    UpdateVendorCouponPayload,
    VendorCouponResponse,
} from "@/types/admin/vendor-cupon";

interface UpdateVendorCouponInput {
    id: number;
    payload: UpdateVendorCouponPayload;
}

export function useUpdateVendorCoupon() {
    const queryClient = useQueryClient();

    return useMutation<VendorCouponResponse, Error, UpdateVendorCouponInput>({
        mutationFn: async ({ id, payload }) => {
            const { data } = await axios.put<VendorCouponResponse>(
                `/api/admin/vendor-cupons/${id}`,
                payload,
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
