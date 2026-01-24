import { Suspense } from "react";
import AdminVendorMarketplace from "./_components/AdminVendorMarketPlace";
import Loader from "@/components/Loader";

export default function AdminVendorMarketplacePage() {
  return (
    <Suspense fallback={<Loader />}>
      <AdminVendorMarketplace />
    </Suspense>
  );
}


