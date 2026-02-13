import { BlockedBookingReport, VendorCalendarReport } from "@/types/vendor-calendar";
import { NextResponse } from "next/server";

export function generateCSVReport(
    bookedForMe: VendorCalendarReport[],
    bookedByMe: VendorCalendarReport[],
    blocked: BlockedBookingReport[],
    vendorName?: string
) {
    const lines: string[] = [];

    // ========== REPORT HEADER ==========
    lines.push("VENDOR BOOKING REPORT");
    lines.push("");
    
    // Report metadata
    lines.push("Report Information");
    if (vendorName) {
        lines.push(`Vendor Name,${escapeCSV(vendorName)}`);
    }
    lines.push(`Generated On,${new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })}`);
    lines.push("");

    // Summary section
    const totalBookedForMe = bookedForMe.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const totalBookedByMe = bookedByMe.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    
    lines.push("SUMMARY");
    lines.push("Category,Count,Total Amount (Rs.)");
    lines.push(`Bookings For Me,${bookedForMe.length},${formatCurrency(totalBookedForMe)}`);
    lines.push(`Bookings By Me,${bookedByMe.length},${formatCurrency(totalBookedByMe)}`);
    lines.push(`Blocked Dates,${blocked.length},N/A`);
    lines.push("");
    lines.push("");

    // ========== BOOKINGS FOR ME SECTION ==========
    if (bookedForMe.length > 0) {
        lines.push("SECTION 1: BOOKINGS FOR ME");
        lines.push("");
        lines.push("Booking ID,Start Date,End Date,Total Amount (Rs.),Advance Paid (Rs.),Balance Due (Rs.),Status");

        bookedForMe.forEach((booking) => {
            lines.push(
                [
                    escapeCSV(booking.uuid || "N/A"),
                    booking.startDate || "N/A",
                    booking.endDate || "N/A",
                    formatCurrency(booking.totalAmount),
                    formatCurrency(booking.advanceAmount),
                    formatCurrency(booking.remainingAmount),
                    escapeCSV(booking.status || "N/A")
                ].join(",")
            );
        });

        // Subtotal for this section
        lines.push("");
        const sectionTotal = bookedForMe.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
        const sectionAdvance = bookedForMe.reduce((sum, b) => sum + (Number(b.advanceAmount) || 0), 0);
        const sectionRemaining = bookedForMe.reduce((sum, b) => sum + (Number(b.remainingAmount) || 0), 0);
        
        lines.push(`SUBTOTAL (${bookedForMe.length} bookings),,,${formatCurrency(sectionTotal)},${formatCurrency(sectionAdvance)},${formatCurrency(sectionRemaining)},`);
        lines.push("");
        lines.push("");
    }

    // ========== BOOKINGS BY ME SECTION ==========
    if (bookedByMe.length > 0) {
        lines.push("SECTION 2: BOOKINGS BY ME");
        lines.push("");
        lines.push("Booking ID,Start Date,End Date,Total Amount (Rs.),Advance Paid (Rs.),Balance Due (Rs.),Status");

        bookedByMe.forEach((booking) => {
            lines.push(
                [
                    escapeCSV(booking.uuid || "N/A"),
                    booking.startDate || "N/A",
                    booking.endDate || "N/A",
                    formatCurrency(booking.totalAmount),
                    formatCurrency(booking.advanceAmount),
                    formatCurrency(booking.remainingAmount),
                    escapeCSV(booking.status || "N/A")
                ].join(",")
            );
        });

        // Subtotal for this section
        lines.push("");
        const sectionTotal = bookedByMe.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
        const sectionAdvance = bookedByMe.reduce((sum, b) => sum + (Number(b.advanceAmount) || 0), 0);
        const sectionRemaining = bookedByMe.reduce((sum, b) => sum + (Number(b.remainingAmount) || 0), 0);
        
        lines.push(`SUBTOTAL (${bookedByMe.length} bookings),,,${formatCurrency(sectionTotal)},${formatCurrency(sectionAdvance)},${formatCurrency(sectionRemaining)},`);
        lines.push("");
        lines.push("");
    }

    // ========== BLOCKED DATES SECTION ==========
    if (blocked.length > 0) {
        lines.push("SECTION 3: BLOCKED DATES");
        lines.push("");
        lines.push("Start Date,End Date,Reason");

        blocked.forEach((block) => {
            lines.push(
                [
                    block.startDate || "N/A",
                    block.endDate || "N/A",
                    escapeCSV(block.reason || "No reason provided")
                ].join(",")
            );
        });

        lines.push("");
        lines.push(`TOTAL BLOCKED PERIODS: ${blocked.length}`);
        lines.push("");
    }

    // ========== FOOTER ==========
    lines.push("");
    lines.push("---");
    lines.push("END OF REPORT");
    lines.push(`Report ID: VBR-${Date.now()}`);

    const content = lines.join("\n");

    return new NextResponse(content, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="vendor-booking-report-${Date.now()}.csv"`,
        },
    });
}

// Helper function to escape CSV values
function escapeCSV(value: string | null | undefined): string {
    if (!value) return "N/A";
    
    const stringValue = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
}

// Helper function to format currency
function formatCurrency(amount: number | string | null | undefined): string {
    const numAmount = Number(amount);
    
    if (isNaN(numAmount) || amount === null || amount === undefined) {
        return "0.00";
    }
    
    return numAmount.toFixed(2);
}