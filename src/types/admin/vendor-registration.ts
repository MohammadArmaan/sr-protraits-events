// src/types/admin/vendor-registration.ts
export type VendorRegistrationStatus =
    | "PENDING_APPROVAL"
    | "BUSINESS_PHOTOS_UPLOADED"
    | "APPROVED"
    | "ACTIVE"
    | "REJECTED";

export interface VendorRegistration {
    vendorId: number;
    fullName: string;
    businessName: string;
    occupation: string;
    businessDescription: string;
    profilePhoto: string;
    businessPhotos: string[];
    phone: string;
    email: string;
    status: VendorRegistrationStatus;
    createdAt: string;
}

export type VendorSortOption =
    | "name_asc"
    | "name_desc"
    | "date_asc"
    | "date_desc";

export interface VendorRegistrationListResponse {
    vendors: VendorRegistration[];
}
