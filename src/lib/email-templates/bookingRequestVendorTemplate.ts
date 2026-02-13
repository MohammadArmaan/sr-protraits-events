// src/lib/email-templates/bookingRequestVendorTemplate.ts
export function bookingRequestVendorTemplate(
    vendorName: string,
    productTitle: string,
    bookingUuid: string,
    approvalExpiresAt: Date
) {
    const gradientPrimary =
        "linear-gradient(135deg, hsl(220, 80%, 55%), hsl(180, 70%, 50%))";

    return `
<!DOCTYPE html>
<html>
  <body style="background:#f4f4f4;margin:0;font-family:Arial,sans-serif;">
    <table width="600" align="center" style="background:white;margin:20px auto;border-radius:12px;border:1px solid #e5e5e5;">
      
      <tr>
        <td style="padding:28px;text-align:center;background:#f8f8f8;">
          <img src="/logo.webp" width="90" />
          <h1 style="margin:10px 0 0;color:hsl(222,47%,11%);">
            SR Portraits & Events
          </h1>
        </td>
      </tr>

      <tr>
        <td style="padding:35px 40px;text-align:center;">
          <h2>Hi ${vendorName} 👋</h2>

          <p style="font-size:16px;color:#444;">
            You have received a new booking request for
            <strong>"${productTitle}"</strong>.
          </p>

          <p style="font-size:15px;color:#555;">
            Please approve or reject this request within
            <strong>8 hours</strong>.
          </p>

          <a href="${process.env.DOMAIN}/vendor/bookings/${bookingUuid}"
             style="display:inline-block;padding:16px 36px;color:white;
                    text-decoration:none;border-radius:9999px;
                    background:${gradientPrimary};
                    font-weight:bold;margin-top:20px;">
            Review Booking
          </a>

          <p style="margin-top:18px;font-size:13px;color:#777;">
            Approval expires at:
            <strong>${approvalExpiresAt.toLocaleString()}</strong>
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:20px;text-align:center;background:#f2f2f2;font-size:12px;color:#777;">
          © ${new Date().getFullYear()} SR Portraits & Events
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
