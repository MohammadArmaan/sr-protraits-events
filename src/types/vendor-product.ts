export type AdvanceType = "PERCENTAGE" | "FIXED";

export interface VendorProduct {
    id: number;
    uuid: string;

    title: string;
    description: string | null;

    basePriceSingleDay: number;
    basePriceMultiDay: number;

    advanceType: "FIXED" | "PERCENTAGE";
    advanceValue: number;

    rating: number;
    ratingCount: number;

    businessName: string;
    occupation: string;

    images: string[];
    featuredImageIndex: number;
}

