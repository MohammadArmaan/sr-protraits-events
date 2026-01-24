import { VendorBankPendingChanges } from "@/types/vendor-bank-details";

export interface VendorBankDetailsEditRequest {
    vendorId: number;

    accountHolderName: string;
    accountNumber: string; // masked from API
    ifscCode: string;

    isPayoutReady: boolean;
    isEdited: boolean;

    pendingChanges: VendorBankPendingChanges | null;

    createdAt: string;
    updatedAt: string;
}

export interface VendorBankDetailsEditListResponse {
    vendors: VendorBankDetailsEditRequest[];
}
