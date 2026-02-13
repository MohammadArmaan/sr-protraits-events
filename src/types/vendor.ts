export interface VendorAuthPayload {
    vendorId: number;
    email: string;
    fullName: string;
    businessName: string;
    occupation: string;
    phone: string;
    address: string;
    businessDescription: string | null;
    profilePhoto: string | null;
    businessPhotos: string[];

    status: string;
    isApproved: boolean;
}

// src/types/vendor.ts
export interface Vendor {
    id: number;
    businessName: string;
    fullName: string;
    occupation: string;
    phone: string;
    address: string;
    email: string;
    points: number;
    passwordHash: string;

    yearsOfExperience: number;
    successfulEventsCompleted: number;
    gstNumber?: string | null;

    emailVerified: boolean;
    emailVerificationOtp?: string | null;
    emailVerificationExpires?: Date | null;

    activationToken?: string | null;
    activationTokenExpires?: Date | null;

    forgotPasswordToken?: string | null;
    forgotPasswordExpires?: Date | null;

    resetPasswordToken?: string | null;
    resetPasswordExpires?: Date | null;

    businessDescription: string | null;
    profilePhoto?: string | null;

    currentStep: number;
    status: string;

    isApproved: boolean;
    approvedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

export interface VendorCatalogImage {
    id: number;
    imageUrl: string;
    createdAt: Date;
}

export interface VendorCatalog {
    id: number;
    vendorId: number;

    title: string;
    description: string | null;

    categoryId: number | null;
    subCategoryId: number | null;

    images: VendorCatalogImage[];

    createdAt: Date;
}

export interface VendorWithCatalogs {
    vendor: Vendor;
    catalogs: VendorCatalog[];
}
