"use client";

import { VendorMarketplaceForm } from "../_components/VendorMarketplaceForm";
import { useCreateVendorProduct } from "@/hooks/queries/admin/vendor-marketplace/useCreateVendorProduct";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateVendorMarketplacePage() {
    const router = useRouter();
    const mutation = useCreateVendorProduct();

    return (
        <VendorMarketplaceForm
            onSubmit={async (payload) => {
                await mutation.mutateAsync(payload);
                toast.success("Listing created");
                router.push("/admin/vendor-marketplace");
            }}
        />
    );
}
