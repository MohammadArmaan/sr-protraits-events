import axios, { AxiosError } from "axios";

interface ApiErrorResponse {
    error?: string;
    message?: string;
}

export async function submitProfileEdit(formData: FormData) {
    try {
        const res = await axios.post("/api/vendors/edit-profile", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
        });

        return res.data;
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;

        const message =
            err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to submit changes";

        throw new Error(message);
    }
}
