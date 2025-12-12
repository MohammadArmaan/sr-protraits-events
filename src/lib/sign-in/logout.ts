import axios from "axios";

export async function logoutVendor(): Promise<boolean> {
    try {
        await axios.post("/api/vendors/logout");

        // Clear client-side items
        sessionStorage.removeItem("onboardingToken");
        sessionStorage.removeItem("vendorToken");
        localStorage.removeItem("vendorData");

        return true;
    } catch (error) {
        console.error("Logout error:", error);
        return false;
    }
}
