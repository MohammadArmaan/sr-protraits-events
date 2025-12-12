import axios from "axios";
import { VendorBusinessDescription } from "@/types/vendor-registration";

export async function submitDescription(
    data: VendorBusinessDescription
): Promise<{ message: string }> {
    const onboardingToken = sessionStorage.getItem("onboardingToken");

    if (!onboardingToken) {
        throw new Error(
            "Missing onboarding token. Please restart registration."
        );
    }

    try {
        const res = await axios.post("/api/vendors/description", {
            onboardingToken,
            businessDescription: data.businessDescription,
        });

        return res.data;
    } catch (err) {
        const message =
            axios.isAxiosError(err) && err.response?.data?.error
                ? err.response.data.error
                : "Failed to save description";

        throw new Error(message);
    }
}
