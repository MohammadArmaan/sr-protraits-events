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

