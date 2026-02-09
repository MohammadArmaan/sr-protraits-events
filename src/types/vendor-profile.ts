export interface VendorProfile {
    id: number;
    fullName: string;
    businessName?: string;
    occupation: string;
    phone: string;
    address: string;
    email: string;
    businessDescription: string;
    profilePhoto?: string;
    businessPhotos: string[];
}