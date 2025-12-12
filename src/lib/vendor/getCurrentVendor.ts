import axios from "axios";
import type { Vendor } from "@/types/vendor";

export async function getCurrentVendor(): Promise<Vendor | null> {
    try {
        const res = await axios.get("/api/vendors/me", { withCredentials: true });
        return res.data.vendor as Vendor;
    } catch {
        return null;
    }
}
