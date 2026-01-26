import PDFDocument from "pdfkit";
import { JSDOM } from "jsdom";

export async function generateInvoicePdf(html: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Parse HTML and extract text content
      const dom = new JSDOM(html);
      const textContent = dom.window.document.body.textContent || "";

      // Add content to PDF (simplified - you'd need to parse the HTML structure)
      doc.fontSize(20).text("Invoice", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(textContent);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}