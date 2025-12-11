import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";

export async function POST(request: Request) {
    try {
        const { subject, toEmail, emailBody } = await request.json();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // SR Brand Colors
        const gradientPrimary =
            "linear-gradient(135deg, hsl(220, 80%, 55%), hsl(180, 70%, 50%))";
        const textPrimaryForeground = "hsl(0, 0%, 100%)";

        const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>SR Portraits & Events</title>
</head>

<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">

<table width="600" cellpadding="0" cellspacing="0" align="center" 
       style="margin: 20px auto; background: #ffffff; border-radius: 10px; 
              border: 1px solid #e6e6e6; overflow: hidden;">
    
    <!-- Header -->
    <tr>
        <td align="center" style="padding: 30px; background: #f8f8f8;">
            <img src="cid:logo" width="90" style="display:block; margin-bottom: 10px;" />
            <h1 style="margin: 0; font-size: 26px; color: hsl(222, 47%, 11%);">
                SR Portraits & Events
            </h1>
        </td>
    </tr>

    <!-- Content -->
    <tr>
        <td style="padding: 30px 40px;">
            <h2 style="margin: 0 0 15px 0; color: hsl(222, 47%, 11%); font-size: 22px;">
                ${subject}
            </h2>

            <p style="color: #444444; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                ${emailBody}
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 25px;">
                <a href="https://sr-vendor-portal-frontend-demo.vercel.app/" 
                   target="_blank"
                   style="
                       display: inline-block;
                       padding: 14px 32px;
                       font-size: 16px;
                       font-weight: bold;
                       border-radius: 9999px;
                       text-decoration: none;
                       background: ${gradientPrimary};
                       color: ${textPrimaryForeground};
                       box-shadow: 0 8px 32px -8px rgba(0,0,0,0.25);
                   ">
                    Explore Platform
                </a>
            </div>
        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td align="center" 
            style="padding: 18px; background: #f2f2f2; font-size: 12px; color: #666;">
            You are receiving this email from SR Portraits & Events.<br />
            &copy; ${new Date().getFullYear()} SR Portraits & Events. All rights reserved.
        </td>
    </tr>
</table>

</body>
</html>
`;

        const mailOptions = {
            from: `SR Portraits & Events <${process.env.GMAIL_EMAIL}>`,
            to: toEmail,
            subject,
            html: emailHtml,
            attachments: [
                {
                    filename: "logo.webp",
                    path: path.join(process.cwd(), "public", "logo.webp"),
                    cid: "logo",
                },
            ],
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { message: "Email sent successfully!" },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to send email." },
            { status: 500 }
        );
    }
}
