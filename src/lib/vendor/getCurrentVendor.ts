import axios from "axios";
import type { VendorWithCatalogs } from "@/types/vendor";

export async function getCurrentVendor(): Promise<VendorWithCatalogs | null> {
    try {
        const res = await axios.get("/api/vendors/me", {
            withCredentials: true,
        });

        if (!res.data?.vendor) return null;

        return {
            vendor: res.data.vendor,
            catalogs: res.data.catalogs ?? [],
        };
    } catch (error) {
        console.error("Failed to fetch vendor", error);
        return null;
    }
}
