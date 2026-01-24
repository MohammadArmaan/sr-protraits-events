import type { Metadata } from "next";
import { BookingRequestedClient } from "../BookingRequestedClient";

interface PageProps {
    params: {
        uuid: string;
    };
}

export const metadata: Metadata = {
    title: "Booking Request Sent | SR Portraits & Events",
    description:
        "Your booking request has been sent successfully. Await vendor approval.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function Page({ params }: PageProps) {
    const { uuid } = await params;
    return <BookingRequestedClient uuid={uuid} />;
}
