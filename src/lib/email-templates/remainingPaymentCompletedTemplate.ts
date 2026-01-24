export function remainingPaymentCompletedTemplate(
    vendorName: string,
    bookingRef: string
) {
    const gradientPrimary =
        "linear-gradient(135deg, hsl(220, 80%, 55%), hsl(180, 70%, 50%))";

    return `
<!DOCTYPE html>
<html>
<body style="background:#f4f4f4;margin:0;font-family:Arial,sans-serif;">
<table width="600" align="center"
       style="background:white;margin:20px auto;
              border-radius:12px;border:1px solid #e5e5e5;">

<tr>
<td style="padding:30px;text-align:center;">

<img src="/logo.webp" width="90" style="margin-bottom:10px;" />

<h2 style="margin:0 0 10px;color:#111;">
Payment Completed 🎉
</h2>

<p style="font-size:16px;color:#444;">
Hi <strong>${vendorName}</strong>,
</p>

<p style="font-size:15px;color:#555;margin:20px 0;">
The remaining payment for your completed event
(<strong>Booking ID: ${bookingRef}</strong>) has been successfully received.
</p>

<p style="font-size:15px;color:#555;">
Your payout is now being processed and will be credited to your
registered bank account within <strong>24–48 hours</strong>.
</p>

<a href="${process.env.DOMAIN}/vendor/orders"
   style="
      display:inline-block;
      padding:14px 36px;
      background:${gradientPrimary};
      color:white;
      text-decoration:none;
      border-radius:9999px;
      font-weight:bold;
      margin-top:25px;
   ">
View Order & Invoice
</a>

<p style="margin-top:30px;font-size:13px;color:#777;">
You can download your invoice anytime from your dashboard.
</p>

</td>
</tr>

<tr>
<td style="padding:16px;text-align:center;
           background:#f2f2f2;color:#777;font-size:12px;">
&copy; ${new Date().getFullYear()} SR Portraits & Events. All rights reserved.
</td>
</tr>

</table>
</body>
</html>
`;
}
