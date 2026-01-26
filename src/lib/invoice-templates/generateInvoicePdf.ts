// src/lib/invoice-templates/generateInvoicePdf.ts

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface InvoiceData {
    invoiceNumber: string;
    issuedAt: Date;

    productTitle: string;

    basePrice: number;
    discountAmount: number;
    finalAmount: number;

    advanceAmount: number;
    remainingAmount: number;

    provider: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
    };

    requester: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
    };
}

export async function generateInvoicePdf(
    data: InvoiceData
): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    const margin = 50;
    let yPosition = height - margin;

    // Color palette
    const primaryColor = rgb(0.1, 0.1, 0.4); // Dark blue
    const accentColor = rgb(0.2, 0.4, 0.8); // Bright blue
    const lightGray = rgb(0.95, 0.95, 0.95);
    const darkGray = rgb(0.4, 0.4, 0.4);
    const textColor = rgb(0.2, 0.2, 0.2);

    // Helper function to draw text
    const drawText = (
        text: string,
        x: number,
        y: number,
        options: {
            size?: number;
            font?: typeof font;
            color?: ReturnType<typeof rgb>;
            align?: "left" | "center" | "right";
            maxWidth?: number;
        } = {}
    ) => {
        const textFont = options.font || font;
        const size = options.size || 10;
        const color = options.color || textColor;
        
        let xPos = x;
        if (options.align === "right") {
            const textWidth = textFont.widthOfTextAtSize(text, size);
            xPos = width - margin - textWidth;
        } else if (options.align === "center") {
            const textWidth = textFont.widthOfTextAtSize(text, size);
            xPos = (width - textWidth) / 2;
        }

        page.drawText(text, {
            x: xPos,
            y: y,
            size: size,
            font: textFont,
            color: color,
        });
    };

    /* =====================================================
       TOP HEADER BAR
    ===================================================== */
    page.drawRectangle({
        x: 0,
        y: height - 60,
        width: width,
        height: 60,
        color: primaryColor,
    });

    drawText("SR Portraits & Events", margin, height - 35, {
        size: 18,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    yPosition = height - 90;

    /* =====================================================
       INVOICE TITLE & INFO
    ===================================================== */
    drawText("INVOICE", margin, yPosition, {
        size: 28,
        font: fontBold,
        color: primaryColor,
    });

    // Invoice details box on the right
    const infoBoxX = width - margin - 220;
    const infoBoxY = yPosition - 10;
    
    page.drawRectangle({
        x: infoBoxX,
        y: infoBoxY,
        width: 220,
        height: 65,
        color: lightGray,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
    });

    drawText("Invoice #", infoBoxX + 15, infoBoxY + 45, {
        size: 9,
        font: fontBold,
        color: darkGray,
    });
    drawText(data.invoiceNumber, infoBoxX + 15, infoBoxY + 32, {
        size: 9,
        color: textColor,
    });

    drawText("Date", infoBoxX + 15, infoBoxY + 18, {
        size: 9,
        font: fontBold,
        color: darkGray,
    });
    drawText(data.issuedAt.toLocaleDateString(), infoBoxX + 15, infoBoxY + 5, {
        size: 9,
        color: textColor,
    });

    yPosition -= 100;

    /* =====================================================
       BOOKED BY & SERVICE PROVIDER (SIDE BY SIDE)
    ===================================================== */
    const leftCol = margin;
    const rightCol = width / 2 + 20;
    const sectionY = yPosition;

    // Left box - Booked By
    page.drawRectangle({
        x: leftCol,
        y: sectionY - 110,
        width: (width / 2) - margin - 30,
        height: 110,
        color: rgb(0.98, 0.98, 1),
        borderColor: accentColor,
        borderWidth: 1.5,
    });

    drawText("Booked By", leftCol + 15, sectionY - 20, {
        size: 10,
        font: fontBold,
        color: accentColor,
    });

    let currentY = sectionY - 40;
    drawText(data.requester.name, leftCol + 15, currentY, { 
        size: 11,
        font: fontBold,
        color: textColor,
    });
    currentY -= 15;
    drawText(data.requester.email, leftCol + 15, currentY, { 
        size: 9,
        color: textColor,
    });
    currentY -= 13;
    if (data.requester.phone) {
        drawText(data.requester.phone, leftCol + 15, currentY, { 
            size: 9,
            color: textColor,
        });
        currentY -= 13;
    }
    if (data.requester.address) {
        // Wrap long address
        const maxWidth = (width / 2) - margin - 60;
        drawText(data.requester.address, leftCol + 15, currentY, { 
            size: 8,
            color: darkGray,
        });
    }

    // Right box - Service Provider
    page.drawRectangle({
        x: rightCol,
        y: sectionY - 110,
        width: (width / 2) - margin - 30,
        height: 110,
        color: rgb(0.98, 1, 0.98),
        borderColor: rgb(0.2, 0.7, 0.4),
        borderWidth: 1.5,
    });

    drawText("Service Provider", rightCol + 15, sectionY - 20, {
        size: 10,
        font: fontBold,
        color: rgb(0.2, 0.6, 0.4),
    });

    currentY = sectionY - 40;
    drawText(data.provider.name, rightCol + 15, currentY, { 
        size: 11,
        font: fontBold,
        color: textColor,
    });
    currentY -= 15;
    drawText(data.provider.email, rightCol + 15, currentY, { 
        size: 9,
        color: textColor,
    });
    currentY -= 13;
    if (data.provider.phone) {
        drawText(data.provider.phone, rightCol + 15, currentY, { 
            size: 9,
            color: textColor,
        });
        currentY -= 13;
    }
    if (data.provider.address) {
        drawText(data.provider.address, rightCol + 15, currentY, { 
            size: 8,
            color: darkGray,
        });
    }

    yPosition -= 150;

    /* =====================================================
       BOOKING DETAILS SECTION
    ===================================================== */
    page.drawRectangle({
        x: margin,
        y: yPosition - 5,
        width: width - 2 * margin,
        height: 25,
        color: primaryColor,
    });

    drawText("Booking Details", margin + 15, yPosition + 5, {
        size: 12,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    yPosition -= 40;

    drawText("Service", margin + 15, yPosition, {
        size: 10,
        font: fontBold,
        color: darkGray,
    });

    yPosition -= 18;
    drawText(data.productTitle, margin + 15, yPosition, {
        size: 11,
        color: textColor,
    });

    yPosition -= 50;

    /* =====================================================
       AMOUNT BREAKDOWN TABLE
    ===================================================== */
    const tableX = margin;
    const tableY = yPosition;
    const tableWidth = width - 2 * margin;
    const rowHeight = 35;
    const numRows = 5;

    // Table header
    page.drawRectangle({
        x: tableX,
        y: tableY - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: lightGray,
    });

    drawText("Description", tableX + 20, tableY - rowHeight + 12, {
        size: 10,
        font: fontBold,
        color: textColor,
    });

    drawText("Amount", tableX + tableWidth - 120, tableY - rowHeight + 12, {
        size: 10,
        font: fontBold,
        color: textColor,
    });

    // Draw horizontal line
    page.drawLine({
        start: { x: tableX, y: tableY - rowHeight },
        end: { x: tableX + tableWidth, y: tableY - rowHeight },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
    });

    let rowY = tableY - rowHeight;

    const drawRow = (label: string, value: string, isBold: boolean = false) => {
        rowY -= rowHeight;
        
        page.drawLine({
            start: { x: tableX, y: rowY + rowHeight },
            end: { x: tableX + tableWidth, y: rowY + rowHeight },
            thickness: 0.5,
            color: rgb(0.85, 0.85, 0.85),
        });

        drawText(label, tableX + 20, rowY + 12, {
            size: 10,
            font: isBold ? fontBold : font,
            color: textColor,
        });

        drawText(value, tableX + tableWidth - 120, rowY + 12, {
            size: 10,
            font: isBold ? fontBold : font,
            color: textColor,
        });
    };

    drawRow("Discount", `- Rs.${data.discountAmount.toFixed(2)}`, false);
    drawRow("Total Amount", `Rs.${data.finalAmount.toFixed(2)}`, true);
    drawRow("Advance Paid", `Rs.${data.advanceAmount.toFixed(2)}`, false);
    drawRow("Remaining (Pay After Event)", `Rs.${data.remainingAmount.toFixed(2)}`, true);

    // Bottom border
    page.drawLine({
        start: { x: tableX, y: rowY },
        end: { x: tableX + tableWidth, y: rowY },
        thickness: 2,
        color: primaryColor,
    });

    /* =====================================================
       FOOTER
    ===================================================== */
    const footerY = 60;

    drawText("Thank you for choosing SR Portraits & Events", margin, footerY, {
        size: 11,
        font: fontBold,
        align: "center",
        color: primaryColor,
    });

    drawText("This is a system generated invoice", margin, footerY - 20, {
        size: 8,
        align: "center",
        color: darkGray,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}