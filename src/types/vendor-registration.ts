export interface VendorBasicInfo {
    fullName: string;
    occupation: string;
    phone: string;
    address: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export type VendorFormData = {
    fullName: string;
    occupation: string;
    phone: string;
    address: string;
    email: string;
    password: string;
    confirmPassword: string;
    otp: string;
    description: string;
    photos: string[];
    verified: boolean; 
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
};
