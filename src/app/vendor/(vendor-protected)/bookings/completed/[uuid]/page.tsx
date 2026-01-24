// app/vendor/bookings/[uuid]/completed/page.tsx

import { Metadata } from "next";
import { CompletedClient } from "./CompletedClient";

interface PageProps {
    params: {
        uuid: string;
    };
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Settlement Completed",
        description:
            "Your booking settlement is complete. Download your invoice and view booking details.",
    };
}

export default async function Page({ params }: PageProps) {
    const { uuid } = await params;
    return <CompletedClient uuid={uuid} />;
}
