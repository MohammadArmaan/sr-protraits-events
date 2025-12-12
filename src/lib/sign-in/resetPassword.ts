import axios from "axios";

interface ResetPayload {
    token: string;
    password: string;
    confirmPassword: string; // ADD THIS
}

export async function resetPassword(
    data: ResetPayload
): Promise<{ message: string }> {
    try {
        const res = await axios.post("/api/vendors/reset-password", data);
        return res.data;
    } catch (err) {
        const message =
            axios.isAxiosError(err) && err.response?.data?.error
                ? err.response.data.error
                : "Failed to reset password";
        throw new Error(message);
    }
}
