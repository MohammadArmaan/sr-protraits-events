// src/types/vendor-coupon.ts

export type VendorCouponType = "FLAT" | "PERCENT" | "UPTO";

export interface VendorCoupon {
    id: number;
    uuid: string;
    code: string;
    type: VendorCouponType;
    value: string; // backend returns decimal as string
    minAmount: number | null;
    maxDiscount: number | null;
    isActive: boolean;
    expiresAt: string;
    createdAt: string;
}

export interface CreateVendorCouponPayload {
    code: string;
    type: VendorCouponType;
    value: number;
    expiresAt: string;
    minAmount?: number | null;
    maxDiscount?: number | null;
}

export interface UpdateVendorCouponPayload {
    code?: string;
    value?: number;
    expiresAt?: string;
    minAmount?: number | null;
    maxDiscount?: number | null;
    isActive?: boolean;
}

export interface VendorCouponListResponse {
    success: true;
    coupons: VendorCoupon[];
}

export interface VendorCouponResponse {
    success: true;
    coupon: VendorCoupon;
}


export interface VendorCouponFormPayload {
    code: string;
    type: VendorCouponType;
    value: number;
    expiresAt: string;
    minAmount: number | null;
    maxDiscount: number | null;
    isActive: boolean;
}
