export type AdvanceType = "PERCENTAGE" | "FIXED";

export interface VendorProduct {
    // Identifiers
    id: number;
    uuid: string;

    // Product info
    title: string;
    description: string | null;

    // Pricing
    basePrice: number | string;
    advanceType: AdvanceType;
    advanceValue: number | string;

    // Ratings
    rating: number | string;
    ratingCount: number;

    // Vendor relation
    vendorId: number;
    businessName: string;
    occupation: string;

    // Images
    businessPhotos: string[];
    featuredImageIndex: number;

    // Optional vendor image fallback
    profilePhoto?: string | null;
}
