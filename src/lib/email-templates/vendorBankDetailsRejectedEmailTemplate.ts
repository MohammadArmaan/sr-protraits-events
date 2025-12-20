export function vendorBankDetailsRejectedEmailTemplate(name: string) {
    const gradientPrimary =
        "linear-gradient(135deg, hsl(0, 80%, 55%), hsl(10, 70%, 50%))";

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
            Hi, ${name}
          </h2>

          <p style="font-size:16px;color:#444;margin-bottom:25px;">
            Your recent update to <strong>bank / payout details</strong> has been
            <strong>rejected</strong> by our admin team.
          </p>

          <p style="font-size:15px;color:#666;margin-bottom:25px;">
            This may be due to incorrect information, formatting issues,
            or details that require correction.
          </p>

          <p style="font-size:15px;color:#666;margin-bottom:25px;">
            Until this is resolved, payouts and advance payments will remain
            <strong>temporarily paused</strong>.
          </p>

          <a href="${process.env.DOMAIN}/vendor/profile"
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
            Review & Resubmit Bank Details
          </a>

          <p style="margin-top:28px;color:#666;font-size:14px;">
            If you believe this was a mistake, feel free to reach out to our support team.
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
</html>`;
}
