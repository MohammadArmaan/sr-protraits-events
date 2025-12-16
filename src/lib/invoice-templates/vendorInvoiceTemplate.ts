interface InvoiceParty {
  name: string;
  email: string;
  phone: string;
  address: string;
  profilePhoto?: string | null;
}

interface InvoiceData {
  invoiceNumber: string;
  bookingDate: string;

  productTitle: string;
  bookingType: string;
  startDate: string;
  endDate: string;
  totalDays: number;

  basePrice: number;
  discountAmount: number;
  finalAmount: number;

  requester: InvoiceParty;
  provider: InvoiceParty;
}

export function vendorInvoiceTemplate(data: InvoiceData) {
  const gradientPrimary =
    "linear-gradient(135deg, hsl(220, 80%, 55%), hsl(180, 70%, 50%))";

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;font-family:Arial,sans-serif;background:#f4f4f4;">
  <table width="720" align="center"
    style="background:#fff;margin:20px auto;border-radius:12px;border:1px solid #e5e5e5;">
    
    <!-- HEADER -->
    <tr>
      <td style="padding:24px;text-align:center;background:#f8f8f8;">
        <img src="cid:logo" width="80" />
        <h1 style="margin:10px 0;">SR Portraits & Events</h1>
        <p style="font-size:14px;color:#666;">INVOICE</p>
      </td>
    </tr>

    <!-- META -->
    <tr>
      <td style="padding:24px;">
        <table width="100%">
          <tr>
            <td>
              <strong>Invoice #</strong><br/>
              ${data.invoiceNumber}
            </td>
            <td align="right">
              <strong>Date</strong><br/>
              ${data.bookingDate}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- PARTIES -->
    <tr>
      <td style="padding:24px;">
        <table width="100%">
          <tr>
            <td width="50%">
              <h3>Booked By</h3>
              <p>
                ${data.requester.name}<br/>
                ${data.requester.email}<br/>
                ${data.requester.phone}<br/>
                ${data.requester.address}
              </p>
            </td>

            <td width="50%">
              <h3>Service Provider</h3>
              <p>
                ${data.provider.name}<br/>
                ${data.provider.email}<br/>
                ${data.provider.phone}<br/>
                ${data.provider.address}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BOOKING DETAILS -->
    <tr>
      <td style="padding:24px;">
        <h3>Booking Details</h3>
        <table width="100%" border="1" cellspacing="0"
          style="border-collapse:collapse;font-size:14px;">
          
          <tr style="background:#f5f5f5;">
            <th align="left" style="padding:10px;">Service</th>
            <th align="left" style="padding:10px;">Dates</th>
            <th align="right" style="padding:10px;">Amount</th>
          </tr>

          <tr>
            <td style="padding:10px;">${data.productTitle}</td>
            <td style="padding:10px;">
              ${data.startDate} → ${data.endDate}<br/>
              (${data.totalDays} day(s))
            </td>
            <td align="right" style="padding:10px;">
              ₹${data.basePrice.toLocaleString()}
            </td>
          </tr>

          <tr>
            <td colspan="2" align="right" style="padding:10px;">
              Discount
            </td>
            <td align="right" style="padding:10px;">
              -₹${data.discountAmount.toLocaleString()}
            </td>
          </tr>

          <tr style="font-weight:bold;">
            <td colspan="2" align="right" style="padding:10px;">
              Total Paid
            </td>
            <td align="right" style="padding:10px;">
              ₹${data.finalAmount.toLocaleString()}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding:20px;text-align:center;background:#f2f2f2;font-size:12px;color:#777;">
        Thank you for choosing SR Portraits & Events
      </td>
    </tr>
  </table>
</body>
</html>`;
}
