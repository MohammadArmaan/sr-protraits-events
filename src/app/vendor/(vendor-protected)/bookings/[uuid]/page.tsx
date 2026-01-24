import type { Metadata } from "next";
import { BookingDecisionClient } from "./BookingDecisionClient";

interface PageProps {
    params: {
        uuid: string;
    };
}

export const metadata: Metadata = {
    title: "Booking Approval | SR Portraits & Events",
    description:
        "Review booking details and approve or reject the booking request.",
    robots: {
        index: false, // important – email action pages should not be indexed
        follow: false,
    },
};

export default async function Page({ params }: PageProps) {
    const { uuid } = await params;
    return <BookingDecisionClient uuid={uuid} />;
}
