// src/lib/email-templates/bookingRequestUserTemplate.ts
export function bookingRequestUserTemplate(
  userName: string,
  productTitle: string
) {

  return `
<!DOCTYPE html>
<html>
  <body style="background:#f4f4f4;margin:0;font-family:Arial,sans-serif;">
    <table width="600" align="center" style="background:white;margin:20px auto;border-radius:12px;border:1px solid #e5e5e5;">
      
      <tr>
        <td style="padding:28px;text-align:center;background:#f8f8f8;">
          <img src="/logo.webp" width="90" />
          <h1>SR Portraits & Events</h1>
        </td>
      </tr>

      <tr>
        <td style="padding:35px 40px;text-align:center;">
          <h2>Hello ${userName} 🎉</h2>

          <p style="font-size:16px;color:#444;">
            Your booking request for
            <strong>"${productTitle}"</strong>
            has been successfully sent.
          </p>

          <p style="font-size:14px;color:#666;">
            The vendor has up to <strong>3 hours</strong> to approve your request.
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
