// src/lib/email-templates/bookingRejectedVendorTemplate.ts
export function bookingRejectedVendorTemplate(
  userName: string,
  productTitle: string
) {
  return `
<!DOCTYPE html>
<html>
  <body style="background:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="600" align="center"
      style="background:white;margin:20px auto;border-radius:12px;border:1px solid #e5e5e5;">
      
      <tr>
        <td style="padding:28px;text-align:center;background:#f8f8f8;">
          <img src="cid:logo" width="90" />
          <h1>SR Portraits & Events</h1>
        </td>
      </tr>

      <tr>
        <td style="padding:35px 40px;text-align:center;">
          <h2>Hello ${userName}</h2>

          <p style="font-size:16px;color:#444;">
            Unfortunately, your booking request for
            <strong>"${productTitle}"</strong>
            was <strong>rejected</strong>.
          </p>

          <p style="font-size:14px;color:#666;">
            You can try booking another vendor or choose a different date.
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
