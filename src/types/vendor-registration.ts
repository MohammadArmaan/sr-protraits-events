export interface VendorBasicInfo {
    fullName: string;
    businessName?: string;   
    occupation: string;
    phone: string;
    address: string;
    email: string;
    yearsOfExperience: number;
    successfulEventsCompleted: number;
    demandPrice: number;
    gstNumber?: string | null;
    password: string;
    confirmPassword: string;
    profilePhoto: File | null;
    hasAcceptedTerms: boolean;
    termsAcceptedAt: Date | null;
}

export type VendorFormData = {
    fullName: string;
    businessName?: string;
    occupation: string;
    phone: string;
    address: string;
    email: string;
    yearsOfExperience: number;
    successfulEventsCompleted: number;
    demandPrice: number;
    gstNumber?: string | null;
    password: string;
    confirmPassword: string;
    otp: string;
    description: string;
    profilePhoto: File | null;
    photos: string[];
    verified: boolean; 
    hasAcceptedTerms: boolean;
    termsAcceptedAt: Date | null;
};

export interface VendorRegisterResponse {
    success: boolean;
    vendorId: number;
    onboardingToken: string;
    message: string;
}

export interface VerifyEmailPayload {
    otp: string;
}

export interface VerifyEmailResponse {
    success: boolean;
    message: string;
    vendorId: number;
}

export type VendorBusinessDescription = {
    businessDescription: string;
};

export type VendorPhotosPayload = {
    photos: File[];
    catalogTitle: string;
    categoryId: number;
    subCategoryId: number;
};
