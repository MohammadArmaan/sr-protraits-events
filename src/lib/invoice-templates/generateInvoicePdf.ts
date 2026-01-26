// src/lib/invoice-templates/generateInvoicePdf.ts

import PDFDocument from "pdfkit";

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
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "A4",
                margin: 50,
            });

            const chunks: Buffer[] = [];
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);

            /* =====================================================
               HEADER
            ===================================================== */
            doc
                .font("Helvetica-Bold")
                .fontSize(20)
                .text("INVOICE", { align: "right" });

            doc
                .font("Helvetica")
                .fontSize(10)
                .text(`Invoice No: ${data.invoiceNumber}`, {
                    align: "right",
                })
                .text(
                    `Date: ${data.issuedAt.toDateString()}`,
                    { align: "right" }
                );

            doc.moveDown(2);

            /* =====================================================
               FROM / TO
            ===================================================== */
            const startY = doc.y;

            // Provider
            doc
                .font("Helvetica-Bold")
                .fontSize(11)
                .text("From", 50, startY);

            doc
                .font("Helvetica")
                .fontSize(10)
                .text(data.provider.name)
                .text(data.provider.email);

            if (data.provider.phone)
                doc.text(data.provider.phone);

            if (data.provider.address)
                doc.text(data.provider.address);

            // Requester
            doc
                .font("Helvetica-Bold")
                .fontSize(11)
                .text("Billed To", 330, startY);

            doc
                .font("Helvetica")
                .fontSize(10)
                .text(data.requester.name, 330)
                .text(data.requester.email);

            if (data.requester.phone)
                doc.text(data.requester.phone, 330);

            if (data.requester.address)
                doc.text(data.requester.address, 330);

            doc.moveDown(3);

            /* =====================================================
               SERVICE DETAILS
            ===================================================== */
            doc
                .font("Helvetica-Bold")
                .fontSize(12)
                .text("Service");

            doc
                .font("Helvetica")
                .fontSize(11)
                .moveDown(0.5)
                .text(data.productTitle);

            doc.moveDown(2);

            /* =====================================================
               AMOUNT SUMMARY BOX
            ===================================================== */
            const boxX = 50;
            const boxY = doc.y;
            const boxWidth = 500;
            const rowHeight = 26;

            // Background
            doc
                .rect(boxX, boxY, boxWidth, rowHeight * 4)
                .fill("#F9FAFB");

            doc.fillColor("#000");

            let rowY = boxY + 15;

            const drawRow = (
                label: string,
                value: string,
                bold = false
            ) => {
                doc
                    .font(bold ? "Helvetica-Bold" : "Helvetica")
                    .fontSize(11)
                    .text(label, boxX + 20, rowY);

                doc
                    .font("Helvetica-Bold")
                    .text(value, boxX + boxWidth - 140, rowY, {
                        align: "right",
                    });

                rowY += rowHeight;
            };

            drawRow(
                "Base Price",
                `₹${data.basePrice.toFixed(2)}`
            );

            drawRow(
                "Discount",
                `- ₹${data.discountAmount.toFixed(2)}`
            );

            drawRow(
                "Advance Paid",
                `₹${data.advanceAmount.toFixed(2)}`
            );

            drawRow(
                "Total Paid",
                `₹${data.finalAmount.toFixed(2)}`,
                true
            );

            doc.moveDown(6);

            /* =====================================================
               FOOTER
            ===================================================== */
            doc
                .font("Helvetica")
                .fontSize(10)
                .text(
                    "Thank you for choosing our service.",
                    { align: "center" }
                );

            doc
                .fontSize(8)
                .fillColor("#6B7280")
                .text(
                    "This is a system generated invoice.",
                    { align: "center" }
                );

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}
