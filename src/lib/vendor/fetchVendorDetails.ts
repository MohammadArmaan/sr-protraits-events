// src/lib/banner/fetchBannerDetails.ts
import { Banner } from "@/types/vendor-banner";
import axios from "axios";

export async function fetchBannerDetails(): Promise<Banner[]> {
    try {
        const res = await axios.get("/api/vendors/banners", {
            withCredentials: true,
        });

        return res.data.banners as Banner[];
    } catch (error) {
        console.error("Failed to fetch banners", error);
        throw new Error("Failed to fetch banners");
    }
}
