import { Metadata } from "next";
import { ProductClient } from "./ProductClient";

export const metadata: Metadata = {
    title: "Vendor Details",
};

interface Props {
    params: { uuid: string };
}

export default async function ProductPage({ params }: Props) {
    const { uuid } = await params;
    return <ProductClient uuid={uuid} />;
}
