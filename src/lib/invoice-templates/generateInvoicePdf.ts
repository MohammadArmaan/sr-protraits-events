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

    requester: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
    };
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    const margin = 40;
    let y = height - margin;

    // Colors - formal black and white only
    const black = rgb(0, 0, 0);
    const darkGray = rgb(0.3, 0.3, 0.3);
    const borderGray = rgb(0.5, 0.5, 0.5);

    // Helper to sanitize text
    const sanitize = (text: string | undefined | null): string => {
        if (!text) return "";
        return String(text).replace(/₹/g, "Rs.").replace(/[^\x00-\x7F]/g, "");
    };

    // Helper to format currency
    const formatCurrency = (amount: number | string | null | undefined): string => {
        const num = Number(amount);
        if (isNaN(num)) return "0.00";
        return num.toFixed(2);
    };

    // Helper to format Indian currency with commas
    const formatIndianCurrency = (amount: number): string => {
        return amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    // Helper to convert number to words (Indian style)
    const numberToWords = (num: number): string => {
        const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
        const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
        const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

        if (num === 0) return "Zero";

        const crores = Math.floor(num / 10000000);
        const lakhs = Math.floor((num % 10000000) / 100000);
        const thousands = Math.floor((num % 100000) / 1000);
        const hundreds = Math.floor((num % 1000) / 100);
        const remainder = Math.floor(num % 100);

        let words = "";

        if (crores > 0) words += ones[crores] + " Crore ";
        if (lakhs > 0) {
            if (lakhs < 10) words += ones[lakhs];
            else if (lakhs < 20) words += teens[lakhs - 10];
            else words += tens[Math.floor(lakhs / 10)] + " " + ones[lakhs % 10];
            words += " Lakh ";
        }
        if (thousands > 0) {
            if (thousands < 10) words += ones[thousands];
            else if (thousands < 20) words += teens[thousands - 10];
            else words += tens[Math.floor(thousands / 10)] + " " + ones[thousands % 10];
            words += " Thousand ";
        }
        if (hundreds > 0) words += ones[hundreds] + " Hundred ";
        if (remainder > 0) {
            if (remainder < 10) words += ones[remainder];
            else if (remainder < 20) words += teens[remainder - 10];
            else words += tens[Math.floor(remainder / 10)] + " " + ones[remainder % 10];
        }

        return words.trim();
    };

    /* =====================================================
       TOP HEADER WITH BORDER
    ===================================================== */
    // Draw border rectangle for entire invoice
    page.drawRectangle({
        x: margin,
        y: margin,
        width: width - 2 * margin,
        height: height - 2 * margin,
        borderColor: black,
        borderWidth: 1.5,
    });

    // Header section
    y = height - margin - 20;

    // Title - TAX INVOICE
    page.drawText("TAX INVOICE", {
        x: width / 2 - 70,
        y: y,
        size: 16,
        font: fontBold,
        color: black,
    });

    page.drawText("ORIGINAL FOR RECIPIENT", {
        x: width - margin - 160,
        y: y,
        size: 8,
        font: font,
        color: black,
    });

    y -= 30;

    // Horizontal line
    page.drawLine({
        start: { x: margin, y: y },
        end: { x: width - margin, y: y },
        thickness: 1,
        color: borderGray,
    });

    y -= 25;

    /* =====================================================
       COMPANY DETAILS (LEFT) & INVOICE INFO (RIGHT)
    ===================================================== */
    const leftX = margin + 15;
    const rightX = width - margin - 180;

    // Company name
    page.drawText("SR Portraits & Events", {
        x: leftX,
        y: y,
        size: 14,
        font: fontBold,
        color: black,
    });

    // Invoice metadata (right side)
    page.drawText("Invoice #:", {
        x: rightX,
        y: y,
        size: 9,
        font: fontBold,
        color: black,
    });
    
    // Split long UUID into multiple lines if needed
    const invoiceId = sanitize(data.invoiceNumber);
    const maxInvoiceWidth = 160;
    const invoiceFont = font;
    const invoiceFontSize = 8;
    
    if (invoiceFont.widthOfTextAtSize(invoiceId, invoiceFontSize) > maxInvoiceWidth) {
        // Split into two lines
        const mid = Math.floor(invoiceId.length / 2);
        const line1 = invoiceId.substring(0, mid);
        const line2 = invoiceId.substring(mid);
        
        page.drawText(line1, {
            x: rightX,
            y: y - 12,
            size: invoiceFontSize,
            font: invoiceFont,
            color: black,
        });
        page.drawText(line2, {
            x: rightX,
            y: y - 22,
            size: invoiceFontSize,
            font: invoiceFont,
            color: black,
        });
    } else {
        page.drawText(invoiceId, {
            x: rightX,
            y: y - 12,
            size: invoiceFontSize,
            font: font,
            color: black,
        });
    }

    y -= 40;

    // Company contact details (left)
    const companyDetails = [
        "Email: srportraitsandevents@gmail.com",
        "Mobile: +91 XXXXXXXXXX",
    ];

    companyDetails.forEach((detail) => {
        page.drawText(sanitize(detail), {
            x: leftX,
            y: y,
            size: 8,
            font: font,
            color: black,
        });
        y -= 12;
    });

    // Invoice Date (right side)
    y = height - margin - 105;
    page.drawText("Invoice Date:", {
        x: rightX,
        y: y,
        size: 9,
        font: fontBold,
        color: black,
    });
    page.drawText(data.issuedAt.toLocaleDateString("en-GB"), {
        x: rightX,
        y: y - 12,
        size: 8,
        font: font,
        color: black,
    });

    y -= 30;

    // Due Date
    const dueDate = new Date(data.issuedAt);
    dueDate.setDate(dueDate.getDate() + 5);
    page.drawText("Due Date:", {
        x: rightX,
        y: y,
        size: 9,
        font: fontBold,
        color: black,
    });
    page.drawText(dueDate.toLocaleDateString("en-GB"), {
        x: rightX,
        y: y - 12,
        size: 8,
        font: font,
        color: black,
    });

    y = height - margin - 180;

    // Horizontal line separator
    page.drawLine({
        start: { x: margin, y: y },
        end: { x: width - margin, y: y },
        thickness: 1,
        color: borderGray,
    });

    y -= 20;

    /* =====================================================
       CUSTOMER DETAILS
    ===================================================== */
    page.drawText("Customer Details:", {
        x: leftX,
        y: y,
        size: 9,
        font: fontBold,
        color: black,
    });
    y -= 15;

    page.drawText(sanitize(data.requester.name), {
        x: leftX,
        y: y,
        size: 10,
        font: fontBold,
        color: black,
    });
    y -= 14;

    if (data.requester.email) {
        page.drawText(sanitize(data.requester.email), {
            x: leftX,
            y: y,
            size: 8,
            font: font,
            color: darkGray,
        });
        y -= 12;
    }

    if (data.requester.phone) {
        page.drawText(sanitize(data.requester.phone), {
            x: leftX,
            y: y,
            size: 8,
            font: font,
            color: darkGray,
        });
        y -= 12;
    }

    if (data.requester.address) {
        page.drawText(sanitize(data.requester.address), {
            x: leftX,
            y: y,
            size: 8,
            font: font,
            color: darkGray,
        });
        y -= 12;
    }

    y -= 20;

    // Horizontal line
    page.drawLine({
        start: { x: margin, y: y },
        end: { x: width - margin, y: y },
        thickness: 1,
        color: borderGray,
    });

    y -= 25;

    /* =====================================================
       SERVICE DETAILS TABLE
    ===================================================== */
    const tableX = margin;
    const tableWidth = width - 2 * margin;
    
    // Table header - without quantity column
    const colPositions = {
        serial: tableX + 10,
        service: tableX + 40,
        rate: tableX + 300,
        amount: tableX + 450,
    };

    // Header border top
    page.drawLine({
        start: { x: tableX, y: y },
        end: { x: tableX + tableWidth, y: y },
        thickness: 1,
        color: black,
    });

    y -= 20;

    // Header text
    const headers = [
        { text: "#", x: colPositions.serial },
        { text: "Service Description", x: colPositions.service },
        { text: "Rate", x: colPositions.rate },
        { text: "Amount", x: colPositions.amount },
    ];

    headers.forEach((header) => {
        page.drawText(header.text, {
            x: header.x,
            y: y,
            size: 9,
            font: fontBold,
            color: black,
        });
    });

    y -= 5;

    // Header border bottom
    page.drawLine({
        start: { x: tableX, y: y },
        end: { x: tableX + tableWidth, y: y },
        thickness: 1,
        color: black,
    });

    y -= 20;

    // Service row
    page.drawText("1", {
        x: colPositions.serial,
        y: y,
        size: 9,
        font: font,
        color: black,
    });

    // Service title
    const serviceTitle = sanitize(data.productTitle);
    const maxServiceWidth = 240;
    if (font.widthOfTextAtSize(serviceTitle, 9) > maxServiceWidth) {
        page.drawText(serviceTitle.substring(0, 35) + "...", {
            x: colPositions.service,
            y: y,
            size: 9,
            font: font,
            color: black,
        });
    } else {
        page.drawText(serviceTitle, {
            x: colPositions.service,
            y: y,
            size: 9,
            font: font,
            color: black,
        });
    }

    // Calculate amount paid (this is what will be shown in the Amount column)
    const amountPaid = data.remainingAmount === 0 
        ? data.finalAmount  // If completed, amount paid = total amount
        : data.advanceAmount;  // If confirmed, amount paid = advance only

    // Show original price with strikethrough if discount exists
    if (data.discountAmount > 0) {
        const originalPrice = formatIndianCurrency(data.basePrice);
        page.drawText(originalPrice, {
            x: colPositions.rate,
            y: y + 8,
            size: 8,
            font: font,
            color: darkGray,
        });

        // Strikethrough line
        const strikeWidth = font.widthOfTextAtSize(originalPrice, 8);
        page.drawLine({
            start: { x: colPositions.rate, y: y + 11 },
            end: { x: colPositions.rate + strikeWidth, y: y + 11 },
            thickness: 0.5,
            color: darkGray,
        });

        // Discounted price
        const discountPercent = ((data.discountAmount / data.basePrice) * 100).toFixed(0);
        page.drawText(`${formatIndianCurrency(data.finalAmount)} (-${discountPercent}%)`, {
            x: colPositions.rate,
            y: y - 5,
            size: 9,
            font: font,
            color: black,
        });
    } else {
        // No discount - just show the price
        page.drawText(formatIndianCurrency(data.finalAmount), {
            x: colPositions.rate,
            y: y,
            size: 9,
            font: font,
            color: black,
        });
    }

    // Amount - show amount paid
    page.drawText(formatIndianCurrency(amountPaid), {
        x: colPositions.amount,
        y: y,
        size: 9,
        font: fontBold,
        color: black,
    });

    y -= 25;

    // Bottom border
    page.drawLine({
        start: { x: tableX, y: y },
        end: { x: tableX + tableWidth, y: y },
        thickness: 1,
        color: black,
    });

    /* =====================================================
       TOTALS TABLE (no gap, continues from service table)
    ===================================================== */
    const totalsTableX = width - margin - 250;
    const totalsTableWidth = 250;
    const labelX = totalsTableX + 10;
    const valueX = totalsTableX + 160;

    y -= 20;

    // Calculate height for left border based on number of rows
    const totalRows = data.remainingAmount > 0 ? 4 : 2; // 4 rows if remaining, 2 if completed
    const rowHeight = 20;
    const tableHeight = totalRows * rowHeight + 25; // Extra for separators

    // Top border
    page.drawLine({
        start: { x: totalsTableX, y: y },
        end: { x: totalsTableX + totalsTableWidth, y: y },
        thickness: 1,
        color: black,
    });

    // Left border for totals table
    page.drawLine({
        start: { x: totalsTableX, y: y },
        end: { x: totalsTableX, y: y - tableHeight },
        thickness: 1,
        color: black,
    });

    // Right border for totals table
    page.drawLine({
        start: { x: totalsTableX + totalsTableWidth, y: y },
        end: { x: totalsTableX + totalsTableWidth, y: y - tableHeight },
        thickness: 1,
        color: black,
    });

    y -= 20;

    // 1. Amount Paid (first row)
    page.drawText("Amount Paid", {
        x: labelX,
        y: y,
        size: 10,
        font: fontBold,
        color: black,
    });
    page.drawText(`Rs. ${formatIndianCurrency(amountPaid)}`, {
        x: valueX,
        y: y,
        size: 10,
        font: fontBold,
        color: black,
    });

    y -= 20;

    // 2. Total Amount (second row)
    page.drawText("Total Amount", {
        x: labelX,
        y: y,
        size: 10,
        font: fontBold,
        color: black,
    });
    page.drawText(`Rs. ${formatIndianCurrency(data.finalAmount)}`, {
        x: valueX,
        y: y,
        size: 10,
        font: fontBold,
        color: black,
    });

    y -= 20;

    // Show additional details only if there's a remaining amount
    if (data.remainingAmount > 0) {
        // Separator line
        page.drawLine({
            start: { x: totalsTableX, y: y },
            end: { x: totalsTableX + totalsTableWidth, y: y },
            thickness: 0.5,
            color: borderGray,
        });

        y -= 20;

        // 3. Advance Paid
        page.drawText("Advance Paid", {
            x: labelX,
            y: y,
            size: 9,
            font: font,
            color: black,
        });
        page.drawText(`Rs. ${formatIndianCurrency(data.advanceAmount)}`, {
            x: valueX,
            y: y,
            size: 9,
            font: font,
            color: black,
        });

        y -= 20;

        // 4. Remaining Amount
        page.drawText("Remaining Amount", {
            x: labelX,
            y: y,
            size: 10,
            font: fontBold,
            color: black,
        });
        page.drawText(`Rs. ${formatIndianCurrency(data.remainingAmount)}`, {
            x: valueX,
            y: y,
            size: 10,
            font: fontBold,
            color: black,
        });

        y -= 5;
    } else {
        y -= 5;
    }

    // Table bottom border
    page.drawLine({
        start: { x: totalsTableX, y: y },
        end: { x: totalsTableX + totalsTableWidth, y: y },
        thickness: 1,
        color: black,
    });

    y -= 30;

    /* =====================================================
       AMOUNT IN WORDS
    ===================================================== */
    const amountInWords = numberToWords(Math.floor(amountPaid));
    
    const wordsLabel = data.remainingAmount === 0 
        ? "Total amount paid (in words):" 
        : "Advance amount paid (in words):";
    
    page.drawText(`${wordsLabel} INR ${amountInWords} Rupees Only.`, {
        x: margin + 15,
        y: y,
        size: 8,
        font: fontBold,
        color: black,
    });

    y -= 35;

    /* =====================================================
       BOOKING STATUS BOX
    ===================================================== */
    let statusText = "";
    
    if (data.remainingAmount === 0) {
        statusText = "BOOKING STATUS: COMPLETED";
    } else if (data.advanceAmount > 0) {
        statusText = "BOOKING STATUS: CONFIRMED (Advance Paid)";
    } else {
        statusText = "BOOKING STATUS: PENDING";
    }

    // Status box
    page.drawRectangle({
        x: margin + 15,
        y: y - 25,
        width: 280,
        height: 30,
        borderColor: black,
        borderWidth: 1,
    });

    page.drawText(statusText, {
        x: margin + 25,
        y: y - 10,
        size: 9,
        font: fontBold,
        color: black,
    });

    y -= 40;

    /* =====================================================
       FOOTER
    ===================================================== */
    const footerY = margin + 50;

    page.drawLine({
        start: { x: margin, y: footerY + 10 },
        end: { x: width - margin, y: footerY + 10 },
        thickness: 1,
        color: borderGray,
    });

    // Authorized signatory
    page.drawText("For SR Portraits & Events", {
        x: width - margin - 150,
        y: footerY - 10,
        size: 8,
        font: font,
        color: black,
    });

    page.drawText("Authorized Signatory", {
        x: width - margin - 150,
        y: footerY - 35,
        size: 7,
        font: font,
        color: darkGray,
    });

    // Footer text
    page.drawText("This is a computer generated document and requires no signature.", {
        x: margin + 15,
        y: footerY - 20,
        size: 7,
        font: font,
        color: darkGray,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}