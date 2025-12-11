export function otpEmailTemplate(otp: string) {
    const gradientPrimary =
        "linear-gradient(135deg, hsl(220, 80%, 55%), hsl(180, 70%, 50%))";

    return `<!DOCTYPE html>
<html>
  <body style="background:#f4f4f4;padding:0;margin:0;font-family:Arial,sans-serif;">
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:white;margin:20px auto;border-radius:12px;border:1px solid #e5e5e5;overflow:hidden;">
      <!-- Header -->
      <tr>
        <td style="padding:28px;text-align:center;background:#f8f8f8;">
          <img src="https://yourdomain.com/logo.png" width="90" style="margin-bottom:10px;" alt="SR Portraits & Events Logo" />
          <h1 style="margin:0;font-size:26px;color:hsl(222,47%,11%);">
            SR Portraits & Events
          </h1>
        </td>
      </tr>
      <!-- OTP Body -->
      <tr>
        <td style="padding:35px 40px;text-align:center;">
          <h2 style="margin-bottom:15px;font-size:22px;color:hsl(222,47%,11%);">
            Your Verification Code
          </h2>
          <p style="font-size:16px;color:#444;margin-bottom:30px;">
            Enter the 6-digit code below to verify your email address.
          </p>
          <!-- OTP BOXES -->
          <table align="center" cellpadding="0" cellspacing="0">
            <tr>
              ${otp
                  .split("")
                  .map(
                      (digit) => `
                <td style="
                  width:55px;
                  height:60px;
                  background:${gradientPrimary};
                  color:white;
                  font-size:28px;
                  font-weight:bold;
                  border-radius:12px;
                  text-align:center;
                  vertical-align:middle;
                  margin:0 8px;
                  display:inline-block;
                  box-shadow:0 4px 16px rgba(0,0,0,0.15);
                ">
                  ${digit}
                </td>`
                  )
                  .join("")}
            </tr>
          </table>
          <p style="margin-top:25px;color:#666;font-size:14px;">
            This code will expire in <strong>10 minutes</strong>.
          </p>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding:20px;text-align:center;background:#f2f2f2;color:#777;font-size:12px;">
          &copy; ${new Date().getFullYear()} SR Portraits & Events. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
