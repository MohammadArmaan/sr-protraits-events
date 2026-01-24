import { Suspense } from "react";
import Loader from "../Loader";
import { ShopFiltersComponent } from "./ShopFiltersComponent";

export function ShopFilters() {
  return (
    <Suspense fallback={<Loader />}>
      <ShopFiltersComponent />
    </Suspense>
  );
}
