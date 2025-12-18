// src/hooks/selectors/useCalendarData.ts
import { useVendorCalendar } from "@/hooks/queries/useVendorCalendar";

export const useCalendarData = () => {
    const query = useVendorCalendar();

    return {
        ...query,
        bookedForMe: query.data?.bookedForMe ?? [],
        bookedByMe: query.data?.bookedByMe ?? [],
        blockedDates: query.data?.blockedDates ?? [],
    };
};
