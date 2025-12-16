import nodemailer from "nodemailer";

interface EmailAttachment {
    filename: string;
    content: Buffer;
    contentType?: string;
}

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    attachments?: EmailAttachment[];
}

export async function sendEmail({
    to,
    subject,
    html,
    attachments,
}: SendEmailParams) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `SR Portraits & Events <${process.env.GMAIL_EMAIL}>`,
            to,
            subject,
            html,
            attachments, // ✅ now supported
        });

        return { success: true };
    } catch (error) {
        console.error("Email Send Error:", error);
        return { success: false, error };
    }
}
