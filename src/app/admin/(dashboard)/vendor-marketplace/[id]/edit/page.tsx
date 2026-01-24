"use client";

import { useParams, useRouter } from "next/navigation";
import { VendorMarketplaceForm } from "../../_components/VendorMarketplaceForm";
import { useUpdateVendorProduct } from "@/hooks/queries/admin/vendor-marketplace/useUpdateVendorProduct";
import { useAdminVendorProduct } from "@/hooks/queries/admin/vendor-marketplace/useAdminVendorProduct";
import { toast } from "sonner";

export default function EditVendorMarketplacePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const productId = Number(id);

    const { data, isLoading } = useAdminVendorProduct(productId);
    const mutation = useUpdateVendorProduct();

    if (isLoading) return null;
    if (!data) return null;

    return (
        <VendorMarketplaceForm
            initialData={data.product} 
            onSubmit={async (payload) => {
                await mutation.mutateAsync({
                    id: productId,
                    payload,
                });
                toast.success("Listing updated");
                router.push("/admin/vendor-marketplace");
            }}
        />
    );
}
