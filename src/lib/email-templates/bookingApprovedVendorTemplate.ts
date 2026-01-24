// src/lib/email-templates/bookingApprovedVendorTemplate.ts
export function bookingApprovedVendorTemplate(
  userName: string,
  productTitle: string,
  bookingUuid: string,
  advanceAmount: number,
  finalAmount: number,
  totalDays?: number
) {
  const gradientPrimary =
    "linear-gradient(135deg, hsl(220, 80%, 55%), hsl(180, 70%, 50%))";

  return `
<!DOCTYPE html>
<html>
  <body style="background:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="600" align="center"
      style="background:white;margin:20px auto;border-radius:12px;border:1px solid #e5e5e5;">
      
      <tr>
        <td style="padding:28px;text-align:center;background:#f8f8f8;">
          <img src="/logo.webp" width="90" />
          <h1>SR Portraits & Events</h1>
        </td>
      </tr>

      <tr>
        <td style="padding:35px 40px;text-align:center;">
          <h2>Good news ${userName}! 🎉</h2>

          <p style="font-size:16px;color:#444;">
            Your booking request for <strong>"${productTitle}"</strong>
            has been <strong>approved</strong>.
          </p>

          ${
            totalDays && totalDays > 1
              ? `<p style="font-size:15px;color:#555;">
                   Duration: <strong>${totalDays} days</strong>
                 </p>`
              : ""
          }

          <table width="100%" cellpadding="0" cellspacing="0"
            style="margin:20px 0;font-size:15px;color:#333;">
            <tr>
              <td align="left">Total Booking Amount</td>
              <td align="right"><strong>₹${finalAmount.toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td align="left">Advance Payable Now</td>
              <td align="right" style="color:#16a34a;">
                <strong>₹${advanceAmount.toLocaleString()}</strong>
              </td>
            </tr>
          </table>

          <a href="${process.env.DOMAIN}/vendor/bookings/pay/${bookingUuid}"
            style="display:inline-block;padding:16px 36px;
                   color:white;text-decoration:none;
                   border-radius:9999px;
                   background:${gradientPrimary};
                   font-weight:bold;margin-top:20px;">
            Pay Advance Now
          </a>

          <p style="margin-top:18px;font-size:13px;color:#777;">
            Remaining amount will be collected after event completion.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:20px;text-align:center;background:#f2f2f2;
                   font-size:12px;color:#777;">
          © ${new Date().getFullYear()} SR Portraits & Events
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
