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

export type RazorpayBankValidationResponse = {
    id: string;
    entity: "bank_account_validation";
    status: "created" | "completed" | "failed";
    bank_account?: {
        bank_name?: string;
        ifsc?: string;
        account_number?: string;
        name?: string;
    };
};

export type RazorpayFundAccountValidationResponse = {
    id: string;
    entity: "fund_account.validation";
    status: "created" | "completed" | "failed";

    utr?: string;
    reference_id?: string;

    validation_results?: {
        account_status: "active" | "inactive" | "";
        registered_name?: string;
        details?: string | null;
        name_match_score?: number | null;
    };

    status_details?: {
        description?: string;
        source?: string;
        reason?: string;
    };

    fund_account: {
        id: string;
        entity: "fund_account";
        account_type: "bank_account";
        active: boolean;

        bank_account: {
            name: string;
            bank_name: string;
            ifsc: string;
            account_number: string;
        };

        contact?: {
            id: string;
            name: string;
            email: string;
            contact: string;
            type: string;
            reference_id?: string;
        };
    };

    created_at: number;
};
