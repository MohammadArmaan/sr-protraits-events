import type { Metadata } from "next";
import { BookingPayClient } from "./BookingPayClient";

export const metadata: Metadata = {
    title: "Complete Payment | SR Portraits & Events",
    description:
        "Securely complete your booking payment. Your booking will be confirmed after successful payment.",
    robots: {
        index: false,
        follow: false, // payment pages should not be indexed
    },
};

export default async function Page({ params }: { params: { uuid: string } }) {
    const { uuid } = await params;
    return <BookingPayClient uuid={uuid} />;
}
