// src/hooks/queries/admin/vendor-coupons/useCreateVendorCoupon.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorCouponQueryKeys } from "./queryKeys";
import {
    CreateVendorCouponPayload,
    VendorCouponResponse,
} from "@/types/admin/vendor-cupon";

export function useCreateVendorCoupon() {
    const queryClient = useQueryClient();

    return useMutation<VendorCouponResponse, Error, CreateVendorCouponPayload>({
        mutationFn: async (payload) => {
            const { data } = await axios.post<VendorCouponResponse>(
                "/api/admin/vendor-cupons",
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
