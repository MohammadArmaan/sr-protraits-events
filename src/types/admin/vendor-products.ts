export type PricingUnit = "PER_DAY" | "PER_EVENT";
export type AdvanceType = "FIXED" | "PERCENTAGE";

/* ---------------------------------- */
/* PRODUCT IMAGE TYPES                */
/* ---------------------------------- */

export interface VendorProductImage {
    id: number;
    imageUrl: string;
    sortOrder: number;
    isFeatured: boolean;
}

export interface VendorProductImagesByCatalog {
    [catalogId: number]: {
        catalogTitle: string;
        featuredImageId: number | null;
        images: VendorProductImage[];
    };
}

/* ---------------------------------- */
/* PRODUCT                            */
/* ---------------------------------- */

export interface AdminVendorProduct {
    id: number;
    uuid: string;
    vendorId: number;
    businessName: string;
    occupation: string;
    title: string;
    description: string | null;
    featuredImageUrl: string | null;

    /** legacy flat array (keep for now) */
    images: string[];
    featuredImageIndex: number;

    basePriceSingleDay: number;
    basePriceMultiDay: number | null;
    pricingUnit: PricingUnit;

    advanceType: AdvanceType;
    advanceValue: number | null;

    isFeatured: boolean;
    isPriority: boolean;
    isActive: boolean;

    isSessionBased: boolean;
    maxSessionHours: number | null;

    createdAt: Date;
}

/* ---------------------------------- */
/* API PAYLOADS                       */
/* ---------------------------------- */

export interface CreateVendorProductPayload {
    vendorId: number;

    catalogIds: number[];

    featuredImageByCatalog: Record<number, number>;

    title: string;
    description?: string;

    isSessionBased: boolean;

    basePriceSingleDay: number;
    basePriceMultiDay: number;
    pricingUnit: PricingUnit;

    advanceType: AdvanceType;
    advanceValue?: number;

    isFeatured: boolean;
    isPriority: boolean;
    isActive: boolean;
}

export type UpdateVendorProductPayload = Partial<CreateVendorProductPayload>;

/* ---------------------------------- */
/* RESPONSES                          */
/* ---------------------------------- */

export interface VendorProductListResponse {
    success: true;
    products: AdminVendorProduct[];
}

export interface VendorProductResponse {
    success: true;
    product: AdminVendorProduct;
    imagesByCatalog: VendorProductImagesByCatalog;
    catalogIds: number[];
}

export interface VendorProductListParams {
    page?: number;
    limit?: number;
    search?: string;
    vendorId?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    isPriority?: boolean;
}
