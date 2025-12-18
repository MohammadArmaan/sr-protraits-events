// src/hooks/queries/useVendorCalendar.ts
import { VendorCalendarResponse } from "@/types/vendor-calendar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";


export const useVendorCalendar = () => {
    return useQuery<VendorCalendarResponse>({
        queryKey: ["vendor-calendar"],
        queryFn: async () => {
            const res = await axios.get<VendorCalendarResponse>(
                "/api/vendors/calendar",
                { withCredentials: true }
            );
            return res.data;
        },
    });
};

