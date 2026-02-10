import { HighestPointsSticker } from "@/components/vendor/HighestPointsSticker";
import { VendorBrowseByCategory } from "@/components/vendor/VendorBrowseByCategory";
import { VendorFeaturedProducts } from "@/components/vendor/VendorFeaturedProducts";
import { VendorHeroSlider } from "@/components/vendor/VendorHeroSlider";

export default function Page() {
    return (
        <div>
            <VendorHeroSlider />
            <HighestPointsSticker />
            <VendorFeaturedProducts />
            <VendorBrowseByCategory />
        </div>
    );
}
