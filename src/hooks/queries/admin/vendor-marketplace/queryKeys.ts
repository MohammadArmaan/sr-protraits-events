import { VendorProductListParams } from "@/types/admin/vendor-products";

export const adminVendorMarketplaceQueryKeys = {
    all: ["admin", "vendor-marketplace"] as const,

    list: (params?: VendorProductListParams) =>
        ["admin", "vendor-marketplace", "list", params ?? {}] as const,

    detail: (id: number) =>
        ["admin", "vendor-marketplace", "detail", id] as const,
};