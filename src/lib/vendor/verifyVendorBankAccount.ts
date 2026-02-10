import axios from "axios";

type RazorpayFundAccountValidationResponse = {
    id: string;
    entity: "fund_account.validation";
    status: "created" | "completed" | "failed";

    fund_account: {
        id: string;
        entity: "fund_account";
        active: boolean;
        bank_account: {
            name: string;
            bank_name: string;
            ifsc: string;
            account_number: string;
        };
        created_at: number;
    };

    results?: {
        account_status: "active" | "inactive" | "invalid";
        registered_name?: string;
    };

    utr?: string;
    created_at: number;
};

export async function verifyVendorBankAccount({
    accountHolderName,
    accountNumber,
    ifscCode,
}: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
}) {
    try {
        const response =
            await axios.post<RazorpayFundAccountValidationResponse>(
                "https://api.razorpay.com/v1/fund_accounts/validate",
                {
                    fund_account: {
                        account_type: "bank_account",
                        bank_account: {
                            name: accountHolderName,
                            account_number: accountNumber,
                            ifsc: ifscCode,
                        },
                    },
                    amount: 100, // ₹1 / ₹0 penny drop (Razorpay recommends 100 paise)
                    currency: "INR",
                },
                {
                    auth: {
                        username: process.env.RAZORPAY_KEY_ID!,
                        password: process.env.RAZORPAY_KEY_SECRET!,
                    },
                },
            );

        const data = response.data;

        // ✅ Razorpay success condition
        if (data.status !== "completed") {
            throw new Error("Bank validation did not complete");
        }

        // ✅ Account-level validation
        if (data.results?.account_status !== "active") {
            throw new Error("Invalid or inactive bank account");
        }

        return {
            success: true as const,
            referenceId: data.id, // fav_xxx
            utr: data.utr ?? null,
            bankName: data.fund_account.bank_account.bank_name,
            registeredName: data.results?.registered_name ?? null,
        };
    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw new Error(
                err.response?.data?.error?.description ||
                    "Invalid bank details",
            );
        }

        throw new Error("Bank verification failed");
    }
}
