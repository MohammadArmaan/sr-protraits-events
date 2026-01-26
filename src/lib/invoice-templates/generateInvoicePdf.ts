import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";

export async function generateInvoicePdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfUint8 = await page.pdf({
    format: "a4",
    printBackground: true,
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();
  return Buffer.from(pdfUint8);
}