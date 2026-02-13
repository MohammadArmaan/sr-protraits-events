import {
    BlockedBookingReport,
    VendorCalendarReport,
} from "@/types/vendor-calendar";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generatePDFReport(
    bookedForMe: VendorCalendarReport[],
    bookedByMe: VendorCalendarReport[],
    blocked: BlockedBookingReport[],
    vendorName?: string,
) {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Minimal color scheme - formal document
    const colors = {
        black: rgb(0, 0, 0),
        darkGray: rgb(0.3, 0.3, 0.3),
        border: rgb(0.5, 0.5, 0.5),
    };

    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const margin = 60;
    let y = height - margin;

    const drawTextInColumn = (
        text: string,
        x: number,
        yPos: number,
        maxWidth: number,
        size = 8,
    ) => {
        const sanitized = sanitizeText(text || "-");
        let finalText = sanitized;

        const textWidth = font.widthOfTextAtSize(finalText, size);

        if (textWidth > maxWidth) {
            while (
                font.widthOfTextAtSize(finalText + "...", size) > maxWidth &&
                finalText.length > 0
            ) {
                finalText = finalText.slice(0, -1);
            }
            finalText += "...";
        }

        page.drawText(finalText, {
            x,
            y: yPos,
            size,
            font,
            color: colors.black,
        });
    };

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
        if (y < margin + requiredSpace) {
            page = pdfDoc.addPage();
            y = height - margin;
            return true;
        }
        return false;
    };

    // Helper to draw a horizontal line
    const drawLine = (yPos: number, thickness = 0.5) => {
        page.drawLine({
            start: { x: margin, y: yPos },
            end: { x: width - margin, y: yPos },
            thickness,
            color: colors.border,
        });
    };

    // Helper to sanitize text for encoding
    const sanitizeText = (text: string) => {
        return text
            .replace(/₹/g, "Rs.") // Replace rupee symbol
            .replace(/[^\x00-\x7F]/g, ""); // Remove other non-ASCII chars
    };

    // ========== HEADER ==========
    // Main title
    page.drawText("VENDOR BOOKING REPORT", {
        x: margin,
        y: y,
        size: 18,
        font: boldFont,
        color: colors.black,
    });
    y -= 5;

    // Title underline
    page.drawLine({
        start: { x: margin, y: y },
        end: { x: margin + 260, y: y },
        thickness: 2,
        color: colors.black,
    });
    y -= 30;

    // Vendor information
    if (vendorName) {
        page.drawText(`Vendor Name:`, {
            x: margin,
            y: y,
            size: 10,
            font: boldFont,
            color: colors.black,
        });
        page.drawText(sanitizeText(vendorName), {
            x: margin + 85,
            y: y,
            size: 10,
            font: font,
            color: colors.black,
        });
        y -= 18;
    }

    // Report generation date
    const reportDate = new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    page.drawText(`Report Generated:`, {
        x: margin,
        y: y,
        size: 10,
        font: boldFont,
        color: colors.black,
    });
    page.drawText(reportDate, {
        x: margin + 115,
        y: y,
        size: 10,
        font: font,
        color: colors.black,
    });
    y -= 30;

    // Separator line
    drawLine(y, 1);
    y -= 25;

    // ========== SUMMARY SECTION ==========
    checkPageBreak(100);

    page.drawText("SUMMARY", {
        x: margin,
        y: y,
        size: 12,
        font: boldFont,
        color: colors.black,
    });
    y -= 20;

    // Summary data
    const totalBookedForMe = bookedForMe.reduce(
        (sum, b) => sum + (Number(b.totalAmount) || 0),
        0,
    );
    const totalBookedByMe = bookedByMe.reduce(
        (sum, b) => sum + (Number(b.totalAmount) || 0),
        0,
    );

    const summaryItems = [
        {
            label: "Total Bookings For Me:",
            value: `${bookedForMe.length} booking(s)`,
            amount: totalBookedForMe,
        },
        {
            label: "Total Bookings By Me:",
            value: `${bookedByMe.length} booking(s)`,
            amount: totalBookedByMe,
        },
        {
            label: "Total Blocked Dates:",
            value: `${blocked.length} period(s)`,
            amount: null,
        },
    ];

    summaryItems.forEach((item) => {
        page.drawText(item.label, {
            x: margin + 10,
            y: y,
            size: 10,
            font: font,
            color: colors.black,
        });

        page.drawText(item.value, {
            x: margin + 200,
            y: y,
            size: 10,
            font: boldFont,
            color: colors.black,
        });

        if (item.amount !== null && item.amount > 0) {
            page.drawText(`(Rs. ${item.amount.toLocaleString("en-IN")})`, {
                x: margin + 320,
                y: y,
                size: 10,
                font: font,
                color: colors.darkGray,
            });
        }

        y -= 18;
    });

    y -= 15;
    drawLine(y, 1);
    y -= 25;

    // ========== BOOKED FOR ME SECTION ==========
    if (bookedForMe.length > 0) {
        checkPageBreak(120);

        page.drawText("SECTION 1: BOOKINGS FOR ME", {
            x: margin,
            y: y,
            size: 12,
            font: boldFont,
            color: colors.black,
        });
        y -= 20;

        // Table header
        const colX = {
            id: margin,
            dates: margin + 170,
            amount: margin + 340,
            status: margin + 430,
        };

        const colWidth = {
            id: 160,
            dates: 150,
            amount: 80,
            status: 70,
        };

        drawLine(y + 5, 0.5);
        y -= 5;

        drawTextInColumn("Booking ID", colX.id, y, colWidth.id, 9);
        drawTextInColumn("Duration", colX.dates, y, colWidth.dates, 9);
        drawTextInColumn("Amount", colX.amount, y, colWidth.amount, 9);
        drawTextInColumn("Status", colX.status, y, colWidth.status, 9);

        y -= 5;
        drawLine(y, 0.5);
        y -= 15;

        // Table rows
        bookedForMe.forEach((booking) => {
            checkPageBreak(25);

            drawTextInColumn(booking.uuid, colX.id, y, colWidth.id);

            drawTextInColumn(
                `${booking.startDate} - ${booking.endDate}`,
                colX.dates,
                y,
                colWidth.dates,
            );

            drawTextInColumn(
                `Rs. ${(Number(booking.totalAmount) || 0).toLocaleString("en-IN")}`,
                colX.amount,
                y,
                colWidth.amount,
            );

            drawTextInColumn(
                booking.status || "-",
                colX.status,
                y,
                colWidth.status,
            );

            y -= 15;
        });

        y -= 5;
        drawLine(y, 0.5);
        y -= 25;
    }

    // ========== BOOKED BY ME SECTION ==========
    if (bookedByMe.length > 0) {
        checkPageBreak(120);

        page.drawText("SECTION 2: BOOKINGS BY ME", {
            x: margin,
            y: y,
            size: 12,
            font: boldFont,
            color: colors.black,
        });
        y -= 20;

        // Table header
        const colX = {
            id: margin,
            dates: margin + 170,
            amount: margin + 340,
            status: margin + 430,
        };

        const colWidth = {
            id: 160,
            dates: 150,
            amount: 80,
            status: 70,
        };

        drawLine(y + 5, 0.5);
        y -= 5;

        page.drawText("Booking ID", {
            x: colX.id,
            y: y,
            size: 10,
            font: boldFont,
            color: colors.black,
        });

        page.drawText("Duration", {
            x: colX.dates,
            y: y,
            size: 9,
            font: boldFont,
            color: colors.black,
        });

        page.drawText("Amount", {
            x: colX.amount,
            y: y,
            size: 9,
            font: boldFont,
            color: colors.black,
        });

        page.drawText("Status", {
            x: colX.status,
            y: y,
            size: 9,
            font: boldFont,
            color: colors.black,
        });

        y -= 5;
        drawLine(y, 0.5);
        y -= 15;

        // Table rows
        bookedByMe.forEach((booking) => {
            checkPageBreak(25);

            drawTextInColumn(booking.uuid, colX.id, y, colWidth.id);

            drawTextInColumn(
                `${booking.startDate} - ${booking.endDate}`,
                colX.dates,
                y,
                colWidth.dates,
            );

            drawTextInColumn(
                `Rs. ${(Number(booking.totalAmount) || 0).toLocaleString("en-IN")}`,
                colX.amount,
                y,
                colWidth.amount,
            );

            drawTextInColumn(
                booking.status || "-",
                colX.status,
                y,
                colWidth.status,
            );

            y -= 15;
        });

        y -= 5;
        drawLine(y, 0.5);
        y -= 25;
    }

    // ========== BLOCKED DATES SECTION ==========
    if (blocked.length > 0) {
        checkPageBreak(120);

        page.drawText("SECTION 3: BLOCKED DATES", {
            x: margin,
            y: y,
            size: 12,
            font: boldFont,
            color: colors.black,
        });
        y -= 20;

        // Table header
        const colX = {
            dates: margin,
            reason: margin + 200,
        };

        drawLine(y + 5, 0.5);
        y -= 5;

        page.drawText("Duration", {
            x: colX.dates,
            y: y,
            size: 9,
            font: boldFont,
            color: colors.black,
        });

        page.drawText("Reason", {
            x: colX.reason,
            y: y,
            size: 9,
            font: boldFont,
            color: colors.black,
        });

        y -= 5;
        drawLine(y, 0.5);
        y -= 15;

        // Table rows
        blocked.forEach((block) => {
            checkPageBreak(25);

            const dateText = `${block.startDate} - ${block.endDate}`;
            page.drawText(sanitizeText(dateText), {
                x: colX.dates,
                y: y,
                size: 8,
                font: font,
                color: colors.black,
            });

            page.drawText(sanitizeText(block.reason || "No reason provided"), {
                x: colX.reason,
                y: y,
                size: 8,
                font: font,
                color: colors.black,
            });

            y -= 15;
        });

        y -= 5;
        drawLine(y, 0.5);
    }

    // ========== FOOTER ON ALL PAGES ==========
    const totalPages = pdfDoc.getPageCount();
    const pages = pdfDoc.getPages();

    pages.forEach((pg, index) => {
        const pgWidth = pg.getSize().width;
        const pgHeight = pg.getSize().height;

        // Footer separator line
        pg.drawLine({
            start: { x: margin, y: 35 },
            end: { x: pgWidth - margin, y: 35 },
            thickness: 0.5,
            color: colors.border,
        });

        // Page number - right aligned
        pg.drawText(`Page ${index + 1} of ${totalPages}`, {
            x: pgWidth - margin - 60,
            y: 20,
            size: 8,
            font: font,
            color: colors.darkGray,
        });

        // Document label - left aligned
        pg.drawText("Vendor Booking Report", {
            x: margin,
            y: 20,
            size: 8,
            font: font,
            color: colors.darkGray,
        });

        // Center text - confidential
        const centerText = "CONFIDENTIAL";
        const centerTextWidth = font.widthOfTextAtSize(centerText, 8);
        pg.drawText(centerText, {
            x: (pgWidth - centerTextWidth) / 2,
            y: 20,
            size: 8,
            font: boldFont,
            color: colors.darkGray,
        });
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=vendor-report-${Date.now()}.pdf`,
        },
    });
}
