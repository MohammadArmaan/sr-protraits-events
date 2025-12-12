import axios, { AxiosError } from "axios";

export interface SignInPayload {
    email: string;
    password: string;
}

export interface SignInResponse {
    message: string;
    token: string;
}

export async function signInVendor(payload: SignInPayload): Promise<SignInResponse> {
    try {
        const res = await axios.post<SignInResponse>("/api/vendors/sign-in", payload, {
            withCredentials: true, // cookie support
        });

        return res.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.error || "Invalid login credentials");
        }

        throw new Error("Failed to sign in");
    }
}
