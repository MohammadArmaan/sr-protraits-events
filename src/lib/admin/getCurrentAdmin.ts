// src/lib/admin/getCurrentAdmin.ts
import axios from "axios";
import type { Admin } from "@/types/admin/admin";

export async function getCurrentAdmin(): Promise<Admin | null> {
    try {
        const res = await axios.get("/api/admin/me", {
            withCredentials: true,
        });

        return res.data.admin as Admin;
    } catch (error) {
        console.error("Failed to fetch admin", error);
        return null;
    }
}
