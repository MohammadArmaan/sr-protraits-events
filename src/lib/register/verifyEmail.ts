// src/lib/register/verifyEmail.ts
import { VerifyEmailPayload, VerifyEmailResponse } from "@/types/vendor-registration";
import axios, { AxiosError } from "axios";

/**
 * Verify vendor email using OTP + onboarding token.
 */
export async function verifyEmail(
    payload: VerifyEmailPayload
): Promise<VerifyEmailResponse> {
    const onboardingToken = sessionStorage.getItem("onboardingToken");

    if (!onboardingToken) {
        throw new Error("Missing onboarding token — restart registration.");
    }

    try {
        const res = await axios.post<VerifyEmailResponse>(
            "/api/vendors/verify-email",
            {
                onboardingToken,
                otp: payload.otp,
            }
        );

        return res.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message =
                error.response?.data?.error ||
                "OTP verification failed. Try again.";
            throw new Error(message);
        }

        throw new Error("Unexpected error during OTP verification.");
    }
}
