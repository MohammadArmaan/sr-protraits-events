import { NextResponse } from "next/server";
import path from "path";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { toEmail, subject, html } = await req.json();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `SR Portraits & Events <${process.env.GMAIL_EMAIL}>`,
            to: toEmail,
            subject,
            html,
            attachments: [
                {
                    filename: "logo.webp",
                    path: path.join(process.cwd(), "public", "logo.webp"),
                    cid: "logo",
                },
            ],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Send Email Route Error:", error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}
