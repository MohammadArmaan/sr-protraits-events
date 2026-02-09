import { VendorBankPendingChanges } from "@/types/vendor-bank-details";

export interface VendorBankDetails {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    isPayoutReady: boolean;
    isEdited: boolean;
    confirmedAt: string | null;
    pendingChanges: VendorBankPendingChanges | null;
    adminApprovedAt: string | null;
}

export interface VendorDetails {
    id: number;
    fullName: string;
    businessName: string;
    occupation: string;
    phone: string;
    email: string;
    address: string;
    businessDescription: string | null;
    profilePhoto: string | null;
    businessPhotos: string[];
    yearsOfExperience: number;
    successfulEventsCompleted: number;
    gstNumber?: string | null;
    points: number;
    demandPrice: number;
catalogs: {
    id: number;
    title: string;
    description: string | null;
    images: {
        id: number;
        imageUrl: string;
    }[];
}[];
    status: string;
    isApproved: boolean;
    approvedAt: string | null;
    createdAt: string;
    bankDetails: VendorBankDetails | null;
}

export interface VendorDetailsResponse {
    success: boolean;
    vendor: VendorDetails;
}