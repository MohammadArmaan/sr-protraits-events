export function requesterPaymentCompletedTemplate({
    requesterName,
    bookingRef,
    productUuid,
}: {
    requesterName: string;
    bookingRef: string;
    productUuid: string;
}) {
    const gradientPrimary =
        "linear-gradient(135deg, hsl(220, 80%, 55%), hsl(180, 70%, 50%))";

    const gradientSecondary =
        "linear-gradient(135deg, hsl(260, 70%, 60%), hsl(220, 80%, 55%))";

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
Booking Completed 🎉
</h2>

<p style="font-size:16px;color:#444;">
Hi <strong>${requesterName}</strong>,
</p>

<p style="font-size:15px;color:#555;margin:20px 0;">
Your booking (<strong>ID: ${bookingRef}</strong>) has been successfully completed,
and the final payment has been received.
</p>

<p style="font-size:15px;color:#555;margin-bottom:24px;">
We hope you had a great experience!  
Your feedback helps vendors improve and helps others book with confidence.
</p>

<!-- CTA Buttons -->
<div style="margin:30px 0;">
    <a href="${process.env.DOMAIN}/calendar"
       style="
          display:inline-block;
          padding:14px 28px;
          background:${gradientPrimary};
          color:white;
          text-decoration:none;
          border-radius:9999px;
          font-weight:bold;
          margin:0 8px 12px;
       ">
       View Calendar
    </a>

    <a href="${process.env.DOMAIN}/vendor/product/${productUuid}"
       style="
          display:inline-block;
          padding:14px 28px;
          background:${gradientSecondary};
          color:white;
          text-decoration:none;
          border-radius:9999px;
          font-weight:bold;
          margin:0 8px 12px;
       ">
       Review Vendor
    </a>
</div>

<p style="font-size:14px;color:#666;margin-top:20px;">
You can view your booking history, invoices, and upcoming events
anytime from your calendar.
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
