import Loader from "@/components/Loader";
import { Suspense } from "react";
import BankEditRequests from "./_components/BankEditRequests";

export default function BankEditRequestsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <BankEditRequests />
    </Suspense>
  );
}

