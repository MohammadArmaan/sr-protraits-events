export function bookingConfirmedRequesterTemplate(
  requesterName: string,
  providerName: string,
  bookingUuid: string
) {
  const gradientPrimary =
    "linear-gradient(135deg, hsl(220, 80%, 55%), hsl(180, 70%, 50%))";

  return `
<!DOCTYPE html>
<html>
<body style="background:#f4f4f4;margin:0;font-family:Arial,sans-serif;">
<table width="600" align="center" style="background:white;margin:20px auto;border-radius:12px;">
<tr>
<td style="padding:30px;text-align:center;">
<h2>Booking Confirmed 🎉</h2>

<p>Hello ${requesterName},</p>

<p>
Your booking has been <strong>successfully confirmed</strong>.
The service provider <strong>${providerName}</strong> has been notified.
</p>

<a href="${process.env.DOMAIN}/vendor/calendar"
   style="display:inline-block;padding:14px 32px;
          background:${gradientPrimary};
          color:white;text-decoration:none;border-radius:9999px;">
View Calendar
</a>

<p style="margin-top:16px;font-size:14px;color:#666;">
Your invoice is attached with this email.
</p>

</td>
</tr>
</table>
</body>
</html>`;
}
