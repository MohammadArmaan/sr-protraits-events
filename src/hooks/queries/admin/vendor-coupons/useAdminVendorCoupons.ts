// src/hooks/queries/admin/vendor-coupons/useAdminVendorCoupons.ts
import { VendorCouponListResponse } from "@/types/admin/vendor-cupon";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { adminVendorCouponQueryKeys } from "./queryKeys";

export function useAdminVendorCoupons() {
    return useQuery<VendorCouponListResponse>({
        queryKey: adminVendorCouponQueryKeys.all,
        queryFn: async () => {
            const { data } = await axios.get<VendorCouponListResponse>(
                "/api/admin/vendor-cupons/list",
            );
            return data;
        },
    });
}
