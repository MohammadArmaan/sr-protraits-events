import { RazorpayFundAccountValidationResponse } from "@/types/vendor-bank-details";
import axios from "axios";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { accountHolderName, accountNumber, ifscCode } = body;

        if (!accountHolderName || !accountNumber || !ifscCode) {
            return Response.json(
                { error: "Missing bank details" },
                { status: 400 },
            );
        }

        const response =
            await axios.post<RazorpayFundAccountValidationResponse>(
                "https://api.razorpay.com/v1/fund_accounts/validations",
                {
                    source_account_number: process.env.RAZORPAY_SOURCE_ACCOUNT!,

                    fund_account: {
                        account_type: "bank_account",
                        bank_account: {
                            name: accountHolderName,
                            account_number: accountNumber,
                            ifsc: ifscCode,
                        },
                        contact: {
                            name: accountHolderName,
                            email: "vendor@platform.com",
                            contact: "9999999999",
                            type: "vendor",
                            reference_id: `vendor-${Date.now()}`,
                        },
                    },
                },
                {
                    auth: {
                        username: process.env.RAZORPAY_KEY_ID!,
                        password: process.env.RAZORPAY_KEY_SECRET!,
                    },
                },
            );

        const data = response.data;

        // Razorpay-level success
        if (data.status !== "completed") {
            return Response.json(
                { error: "Bank validation did not complete" },
                { status: 400 },
            );
        }

        // Account validity
        if (data.validation_results?.account_status !== "active") {
            return Response.json(
                { error: "Invalid or inactive bank account" },
                { status: 400 },
            );
        }

        return Response.json({
            verified: true,
            referenceId: data.id,
            utr: data.utr ?? null,
            bankName: data.fund_account.bank_account.bank_name,
            registeredName: data.validation_results?.registered_name ?? null,
        });
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return Response.json(
                {
                    error:
                        err.response?.data?.error?.description ||
                        "Bank verification failed",
                },
                { status: 400 },
            );
        }

        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
