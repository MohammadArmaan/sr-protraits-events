import type { Metadata } from "next";
import { BookingConfirmedClient } from "./BookingConfirmedClient";

export const metadata: Metadata = {
    title: "Booking Confirmed 🎉 | SR Portraits & Events",
    description: "Your booking has been confirmed and payment was successful.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function Page({ params }: { params: { uuid: string } }) {
    const { uuid } = await params;
    return <BookingConfirmedClient uuid={uuid} />;
};
