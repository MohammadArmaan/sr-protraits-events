export type AdvanceType = "PERCENTAGE" | "FIXED";

export interface VendorProduct {
    id: number;
    uuid: string;
    vendorId: number;

    title: string;
    description: string | null;

    basePriceSingleDay: number;
    basePriceMultiDay: number;

    advanceType: "FIXED" | "PERCENTAGE";
    advanceValue: number;

    rating: number;
    ratingCount: number;

    businessName?: string;
    occupation: string;

    images: string[];
    featuredImageIndex: number;
}

/* ------------------ Related Products Types ------------------ */


export interface RelatedVendorProduct {
    id: number;
    uuid: string;
    title: string;

    basePriceSingleDay: string;
    basePriceMultiDay: string;

    advanceType: AdvanceType;
    advanceValue: string | null;

    rating: string;
    ratingCount: number;

    businessName: string;
    occupation: string;

    images: string[];
    featuredImageIndex: number;
}

export interface RelatedVendorProductsResponse {
    products: RelatedVendorProduct[];
}

