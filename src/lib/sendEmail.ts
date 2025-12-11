import nodemailer from "nodemailer";

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
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
        });

        return { success: true };
    } catch (error) {
        console.error("Email Send Error:", error);
        return { success: false, error };
    }
}
