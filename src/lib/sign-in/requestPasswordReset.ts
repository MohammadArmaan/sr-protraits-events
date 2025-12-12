import axios from "axios";

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
        const res = await axios.post("/api/vendors/forgot-password", {
            email,
        });

        return res.data;
    } catch (err) {
        const message =
            axios.isAxiosError(err) && err.response?.data?.error
                ? err.response.data.error
                : "Failed to send reset link.";
        throw new Error(message);
    }
}
