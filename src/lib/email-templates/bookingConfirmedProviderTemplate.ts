export function bookingConfirmedProviderTemplate(
    providerName: string,
    requesterName: string
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
<h2>New Booking Confirmed ✅</h2>

<p>Hello ${providerName},</p>

<p>
Your service has been booked by <strong>${requesterName}</strong>.
</p>

<p>
Please check your calendar for upcoming events.
</p>

<a href="${process.env.DOMAIN}/vendor/calendar"
   style="display:inline-block;padding:14px 32px;
          background:${gradientPrimary};
          color:white;text-decoration:none;border-radius:9999px;">
Open Calendar
</a>

</td>
</tr>
</table>
</body>
</html>`;
}
