import { Metadata } from "next";
import { SettlementClient } from "../SettlementClient";

interface PageProps {
    params: {
        uuid: string;
    };
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Complete Settlement | SR Portraits & Events",
        description:
            "Finalize your booking by completing the remaining payment securely. Download invoice and complete settlement with confidence.",
        
    };
}

export default async function Page({ params }: PageProps) {
    const { uuid } = await params;
    return <SettlementClient uuid={uuid} />;
}
