import { VendorRegisterResponse } from "@/types/vendor-registration";
import axios, { AxiosError } from "axios";

/**
 * Sends Step 1 vendor registration data using multipart/form-data
 */
export async function submitBasicInfo(
    form: FormData
): Promise<VendorRegisterResponse> {
    try {
        const response = await axios.post<VendorRegisterResponse>(
            "/api/vendors/register",
            form
            // ❌ DO NOT set Content-Type manually
        );

        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const axiosErr = err as AxiosError<{ error?: string }>;
            const message =
                axiosErr.response?.data?.error ??
                "Registration failed. Try again.";
            throw new Error(message);
        }

        throw new Error("Unexpected error occurred.");
    }
}
