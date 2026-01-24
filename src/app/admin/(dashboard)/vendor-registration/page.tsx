import Loader from "@/components/Loader";
import { Suspense } from "react";
import VendorRegistration from "./_components/VendorRegistration";

export default function VendorRegistrationPage() {
  return (
    <Suspense fallback={<Loader />}>
      <VendorRegistration />
    </Suspense>
  );
}
