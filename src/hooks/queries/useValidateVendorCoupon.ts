// src/hooks/queries/useValidateCoupon.ts
import { useMutation } from "@tanstack/react-query";
import {
    ValidateCouponRequest,
    ValidateCouponResponse,
} from "@/types/vendor-booking";

export const useValidateVendorCoupon = () => {
    return useMutation<
        ValidateCouponResponse,
        Error,
        ValidateCouponRequest
    >({
        mutationFn: async ({ code, amount }) => {
            const res = await fetch("/api/vendors/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, amount }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Invalid coupon");
            }

            return res.json() as Promise<ValidateCouponResponse>;
        },
    });
};
