import { VendorBasicInfo, VendorRegisterResponse } from "@/types/vendor-registration";
import axios, { AxiosError } from "axios";

/**
 * Sends Step 1 vendor registration data to backend using Axios.
 */
export async function submitBasicInfo(
    data: VendorBasicInfo
): Promise<VendorRegisterResponse> {
    try {
        const response = await axios.post<VendorRegisterResponse>(
            "/api/vendors/register",
            data,
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        return response.data;
    } catch (err) {
        /**
         * Type guard: checks whether err is an AxiosError
         */
        if (axios.isAxiosError(err)) {
            const axiosErr = err as AxiosError<{ error?: string }>;

            const message =
                axiosErr.response?.data?.error ??
                "Registration failed. Try again.";

            throw new Error(message);
        }

        // Fallback for unexpected unknown errors
        throw new Error("Unexpected error occurred.");
    }
}
