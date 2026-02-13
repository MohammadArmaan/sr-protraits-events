import { VendorCalendarReport } from "@/types/vendor-calendar";
import { BlockedBookingReport } from "@/types/vendor-calendar";

export function mapBookingToReport(
    row: any
): VendorCalendarReport {
    return {
        id: row.id,
        uuid: row.uuid,
        vendorId: row.vendorId,
        bookedByVendorId: row.bookedByVendorId,
        vendorProductId: row.vendorProductId,

        totalAmount: row.totalAmount,
        advanceAmount: row.advanceAmount,
        remainingAmount: row.remainingAmount,

        bookingType: row.bookingType as "SINGLE_DAY" | "MULTI_DAY",

        startDate: row.startDate,
        endDate: row.endDate,

        startTime: row.startTime,
        endTime: row.endTime,

        totalDays: row.totalDays,
        finalAmount: row.finalAmount,

        status: row.status as any, // if enum in DB, better to define enum type

        notes: row.notes,

        createdAt: row.createdAt?.toISOString() ?? "",
        updatedAt: row.updatedAt?.toISOString() ?? "",
    };
}


export function mapBlockedToReport(row: any): BlockedBookingReport {
    return {
        bookingType: "MULTI_DAY", // literal preserved
        startDate: row.startDate,
        endDate: row.endDate,
        startTime: null,
        endTime: null,
        reason: row.reason ?? undefined,
    };
}
