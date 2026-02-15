export interface VendorProductImage {
    id: number;
    catalogId: number;
    imageUrl: string;
    isFeatured: boolean;
    sortOrder: number;
}

export interface ImagesByCatalog {
    [catalogId: number]: {
        catalogTitle: string;
        featuredImageId: number | null;
        images: VendorProductImage[];
    };
}

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

    occupation: string;

    featuredImageUrl: string;

    subCategoryName: string | null;

    isSessionBased: boolean;
    maxSessionHours: number;

    imagesByCatalog: ImagesByCatalog;
}

export interface VendorProductImage {
    id: number;
    imageUrl: string;
    isFeatured: boolean;
    sortOrder: number;
}

export interface VendorProductImagesByCatalog {
    [catalogId: number]: {
        catalogTitle: string;
        images: VendorProductImage[];
        featuredImageId: number | null;
    };
}

export interface RelatedVendorProduct {
    id: number;
    uuid: string;
    title: string;

    basePriceSingleDay: number;
    basePriceMultiDay: number;

    advanceType: "FIXED" | "PERCENTAGE";
    advanceValue: number;

    rating: number;
    ratingCount: number;

    occupation: string;
    businessName: string;

    featuredImageUrl: string;
    isSessionBased: boolean;
}

export interface RelatedVendorProductsResponse {
    products: RelatedVendorProduct[];
}
