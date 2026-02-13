/* ----------------------------------
 Booking Status (Calendar-safe)
---------------------------------- */
export type BookingStatus =
    | "REQUESTED"
    | "PAYMENT_PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "REJECTED"
    | "CANCELLED"
    | "EXPIRED";

/* ----------------------------------
 Calendar Booking Entity
---------------------------------- */
export interface VendorBooking {
    id: number;
    uuid: string;

    vendorId: number;
    bookedByVendorId: number;
    vendorProductId: number;

    bookingType: "SINGLE_DAY" | "MULTI_DAY";

    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD

    startTime: string | null; // HH:mm
    endTime: string | null;   // HH:mm

    totalDays: number;
    finalAmount: string; // numeric → string

    status: BookingStatus;
    notes: string | null;

    createdAt: string;
    updatedAt: string;
}

/* ----------------------------------
 Vendor Calendar Block (Availability)
---------------------------------- */
export interface VendorCalendarBlock {
    id: number;
    uuid: string;

    vendorId: number;

    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    reason: string | null;

    createdAt: string;
}

/* ----------------------------------
 Calendar API Response
---------------------------------- */
export interface VendorCalendarResponse {
    bookedForMe: VendorBooking[]; // I am the service provider
    bookedByMe: VendorBooking[];  // I am the requester
    blockedDates: VendorCalendarBlock[];
}

/* ----------------------------------
 Calendar Reports
---------------------------------- */
export interface VendorCalendarReport {
    id: number;
    uuid: string;

    vendorId: number;
    bookedByVendorId: number;
    vendorProductId: number;

    totalAmount: string;
    advanceAmount: string;
    remainingAmount: string;

    bookingType: "SINGLE_DAY" | "MULTI_DAY";

    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD

    startTime: string | null; // HH:mm
    endTime: string | null;   // HH:mm

    totalDays: number;
    finalAmount: string; // numeric → string

    status: BookingStatus;
    notes: string | null;

    createdAt: string;
    updatedAt: string;
}

export type BookingType = "SINGLE_DAY" | "MULTI_DAY";

export interface BlockedBookingReport {
    bookingType: BookingType;
    startDate: string;
    endDate: string;
    startTime: string | null;
    endTime: string | null;
    reason?: string;
}
