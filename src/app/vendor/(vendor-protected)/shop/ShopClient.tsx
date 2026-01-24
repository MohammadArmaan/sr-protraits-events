import { Suspense } from "react";
import Loader from "@/components/Loader";
import ShopClientFull from "./ShopClientFull";

export default function ShopClient() {
  return (
    <Suspense fallback={<Loader />}>
      <ShopClientFull />
    </Suspense>
  );
}

