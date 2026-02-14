import axios from "axios";
import { VendorPhotosPayload } from "@/types/vendor-registration";

export async function submitPhotos({
    photos,
    catalogTitle,
    categoryId,
    subCategoryId,
}: VendorPhotosPayload): Promise<{ message: string }> {
    const onboardingToken = sessionStorage.getItem("onboardingToken");

    if (!onboardingToken) {
        throw new Error("Missing onboarding token.");
    }

    if (!catalogTitle.trim()) {
        throw new Error("Catalog title is required.");
    }

    const form = new FormData();
    form.append("onboardingToken", onboardingToken);
    form.append("catalogTitle", catalogTitle);
    form.append("categoryId", String(categoryId));
    form.append("subCategoryId", String(subCategoryId));

    photos.forEach((file) => {
        form.append("files", file);
    });

    try {
        const res = await axios.post("/api/vendors/upload-photos", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res.data;
    } catch (err) {
        const message =
            axios.isAxiosError(err) && err.response?.data?.error
                ? err.response.data.error
                : "Failed to upload photos";

        throw new Error(message);
    }
}
