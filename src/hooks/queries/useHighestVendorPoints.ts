import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type LeaderboardPeriod = "weekly" | "monthly";

export type VendorLeaderboardItem = {
    vendorId: number;
    businessName: string | null;
    fullName: string;
    profilePhoto: string | null;
    experience: number;
    successfulEventsCompleted: number;
    points: number;
    rank: number;
};

export function useHighestVendorPoints(period: LeaderboardPeriod) {
    return useQuery({
        queryKey: ["highest-vendor-points", period],

        queryFn: async (): Promise<VendorLeaderboardItem[]> => {
            const { data } = await axios.get(
                "/api/vendors/highest-vendor-points",
                {
                    params: { period },
                    withCredentials: true,
                },
            );

            return data;
        },

        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
        enabled: !!period,
    });
}
