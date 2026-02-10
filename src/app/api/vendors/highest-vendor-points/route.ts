import { getTopVendorPoints } from "@/lib/vendor/getTopVendorPoints";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");

    if (period !== "weekly" && period !== "monthly") {
        return Response.json(
            { error: "Invalid period. Use weekly or monthly." },
            { status: 400 },
        );
    }

    const vendors = await getTopVendorPoints(period);

    return Response.json(vendors);
}
