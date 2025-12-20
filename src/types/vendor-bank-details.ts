export interface VendorBankPendingChanges {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
}

export interface VendorBankDetails {
    accountHolderName: string;
    ifscCode: string;
    accountNumber: string; // masked from API
    isPayoutReady: boolean;
    isEdited: boolean;
}

export interface VendorBankDetailsResponse {
    bankDetails: VendorBankDetails | null;
}