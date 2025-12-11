export function resetPasswordTemplate(name: string, resetUrl: string) {
    const gradientPrimary =
        "linear-gradient(135deg, hsl(220,80%,55%), hsl(180,70%,50%))";

    return `
<!DOCTYPE html>
<html>
  <body style="background:#f4f4f4;padding:0;margin:0;font-family:Arial,sans-serif;">

    <table width="600" align="center" cellpadding="0" cellspacing="0"
           style="background:white;margin:20px auto;border-radius:12px;
                  border:1px solid #e5e5e5;overflow:hidden;">

      <!-- HEADER -->
      <tr>
        <td style="padding:28px;text-align:center;background:#f8f8f8;">
          <img src="cid:logo" width="90" style="margin-bottom:10px;" />
          <h1 style="margin:0;font-size:26px;color:hsl(222,47%,11%);">
            SR Portraits & Events
          </h1>
        </td>
      </tr>

      <!-- BODY -->
      <tr>
        <td style="padding:35px 40px;text-align:center;">

          <h2 style="margin-bottom:10px;font-size:24px;color:hsl(222,47%,11%);">
            Password Reset Request
          </h2>

          <p style="font-size:16px;color:#444;margin-bottom:25px;">
            Hello ${name},<br />
            We received a request to reset your password.  
            Click the button below to create a new one.
          </p>

          <!-- RESET BUTTON -->
          <a href="${process.env.DOMAIN}${resetUrl}"
             style="
                display:inline-block;
                padding:16px 36px;
                font-size:16px;
                font-weight:bold;
                color:white;
                text-decoration:none;
                border-radius:9999px;
                background:${gradientPrimary};
                box-shadow:0 8px 32px -8px rgba(0,0,0,0.25);
                margin-top:20px;
             ">
            Reset My Password
          </a>

          <p style="margin-top:28px;color:#666;font-size:14px;">
            This link expires in <strong>10 minutes</strong>.<br />
            If you didn’t request this, simply ignore this email.
          </p>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding:20px;text-align:center;background:#f2f2f2;color:#777;font-size:12px;">
          &copy; ${new Date().getFullYear()} SR Portraits & Events. All rights reserved.
        </td>
      </tr>

    </table>

  </body>
</html>
`;
}
