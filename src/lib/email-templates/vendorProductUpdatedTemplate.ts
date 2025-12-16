export function vendorProductUpdatedTemplate(
    vendorName: string,
    productTitle: string,
    productUuid: string
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
          <img src="cid:logo" width="90" />
          <h1 style="color:hsl(222,47%,11%);">SR Portraits & Events</h1>
        </td>
      </tr>

      <tr>
        <td style="padding:35px 40px;text-align:center;">
          <h2>Hi ${vendorName},</h2>

          <p style="font-size:16px;color:#444;">
            Your product <strong>"${productTitle}"</strong> has been
            <strong>updated</strong> by our admin team.
          </p>

          <a href="${process.env.DOMAIN}/vendor/product/${productUuid}"
             style="display:inline-block;padding:16px 36px;
                    color:white;text-decoration:none;border-radius:9999px;
                    background:${gradientPrimary};font-weight:bold;">
            View Updated Product
          </a>

          <p style="margin-top:24px;font-size:14px;color:#666;">
            Please review the changes to ensure everything looks correct.
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
