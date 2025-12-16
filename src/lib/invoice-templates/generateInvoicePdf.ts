import puppeteer from "puppeteer";

export async function generateInvoicePdf(
  html: string
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfUint8 = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();

  // FIX: Convert Uint8Array → Buffer
  return Buffer.from(pdfUint8);
}
