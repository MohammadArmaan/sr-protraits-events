export type PricingUnit = "PER_DAY" | "PER_EVENT";
export type AdvanceType = "FIXED" | "PERCENTAGE";

export interface AdminVendorProduct {
    id: number;
    uuid: string;

    vendorId: number;
    businessName: string;
    businessDescription: string;
    occupation: string;

    title: string;
    description: string | null;
    images: string[];
    featuredImageIndex: number;

    basePriceSingleDay: number;
    basePriceMultiDay: number;
    pricingUnit: PricingUnit;

    advanceType: AdvanceType;
    advanceValue: number;

    rating: number;
    ratingCount: number;

    isFeatured: boolean;
    isActive: boolean;

    createdAt: string;
}

export interface CreateVendorProductPayload {
    vendorId: number;

    title: string;
    description?: string;

    images: string[];
    featuredImageIndex?: number;

    basePriceSingleDay: number;
    basePriceMultiDay: number;
    pricingUnit?: PricingUnit;

    advanceType?: AdvanceType;
    advanceValue?: number;

    isFeatured?: boolean;
    isActive?: boolean;
}

export type UpdateVendorProductPayload = Partial<CreateVendorProductPayload>;

export interface VendorProductListResponse {
    success: true;
    products: AdminVendorProduct[];
}

export interface VendorProductResponse {
    success: true;
    product: AdminVendorProduct;
}

export interface VendorProductListParams {
    page?: number;
    limit?: number;
    sort?: "createdAt" | "title";
    order?: "asc" | "desc";
    isActive?: boolean;
}