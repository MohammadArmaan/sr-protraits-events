// src/types/vendors-booking.ts

/* ----------------------------------
 Shared enums
---------------------------------- */
export type BookingType = "SINGLE_DAY" | "MULTI_DAY";

export type BookingStatus =
    | "REQUESTED"
    | "PAYMENT_PENDING"
    | "CONFIRMED"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED"
    | "COMPLETED";

export type PaymentStatus = "CREATED" | "PAID" | "FAILED";

/* ----------------------------------
 Booking request
---------------------------------- */
export interface CreateBookingRequest {
    vendorProductId: number;
    startDate: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    startTime?: string; // HH:mm
    endTime?: string; // HH:mm
    couponCode?: string; // FLAT50 -> This format
    notes?: string;
}

/* ----------------------------------
 Coupon Code Validation
---------------------------------- */
export interface ValidateCouponRequest {
    code: string;
    amount: number;
}

export interface ValidateCouponResponse {
    code: string;
    discountAmount: number;
    finalAmount: number;
}
/* ----------------------------------
 Booking entity
---------------------------------- */
export interface VendorBooking {
    id: number;
    uuid: string;
    vendorId: number;
    bookedByVendorId: number;
    vendorProductId: number;

    bookingType: BookingType;

    startDate: string;
    endDate: string;

    startTime: string | null;
    endTime: string | null;

    basePrice: string;
    totalDays: number;
    totalAmount: string;

    couponCode: string | null;
    discountAmount: string;
    finalAmount: string;

    status: BookingStatus;

    approvalExpiresAt: string | null;

    notes: string | null;
    source: "WEB";

    createdAt: string;
    updatedAt: string;
}

/* ----------------------------------
 Create booking response
---------------------------------- */
export interface CreateBookingResponse {
    success: boolean;
    message: string;
    booking: VendorBooking;
}

/* ----------------------------------
 Booking Decision to be made
---------------------------------- */
export interface BookingDecisionDetails {
    booking: {
        uuid: string;
        status: string;
        bookingType: "SINGLE_DAY" | "MULTI_DAY";
        startDate: string;
        endDate: string;
        startTime?: string | null;
        endTime?: string | null;
        totalDays: number;
        finalAmount: string;
        approvalExpiresAt: string;

        product: {
            title: string;
        };

        vendor: {
            businessName: string;
            email: string;
        };

        bookedBy: {
            businessName: string;
            email: string;
        };
    };
}

/* ----------------------------------
 Decision response
---------------------------------- */
export interface BookingDecisionResponse {
    success: boolean;
    status: BookingStatus;
}

/* ----------------------------------
 Razorpay order
---------------------------------- */
export interface RazorpayOrderResponse {
    key: string;
    orderId: string;
    amount: number; // paise
    currency: string;
}

/* ----------------------------------
 Razorpay verification
---------------------------------- */
export interface VerifyPaymentRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
}

/* ----------------------------------
 Active Booking
---------------------------------- */
export interface ActiveBookingTypes {
    hasActiveBooking: boolean;
    nextAvailableDate?: string;
}
/* ----------------------------------
 Blocked dates
---------------------------------- */
export interface BlockedBooking {
    bookingType: BookingType;
    startDate: string;
    endDate: string;
    startTime: string | null;
    endTime: string | null;
}

export interface BlockedDatesResponse {
    blocked: BlockedBooking[];
}

export interface RazorpaySuccessResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}
/* ----------------------------------
 Razorpay types
---------------------------------- */
export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description: string;
    handler: (response: RazorpaySuccessResponse) => void;
    theme?: {
        color?: string;
    };
}
