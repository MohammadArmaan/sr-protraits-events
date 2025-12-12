import axios from "axios";

export async function finishRegistration(): Promise<{ message: string }> {
    const onboardingToken = sessionStorage.getItem("onboardingToken");

    if (!onboardingToken) {
        throw new Error("Missing onboarding token.");
    }

    try {
        const res = await axios.post("/api/vendors/finish", {
            onboardingToken,
        });

        // Clear token from browser
        sessionStorage.removeItem("onboardingToken");

        return res.data;
    } catch (err) {
        const message =
            axios.isAxiosError(err) && err.response?.data?.error
                ? err.response.data.error
                : "Failed to complete registration.";
        throw new Error(message);
    }
}
