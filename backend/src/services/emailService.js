import nodemailer from "nodemailer";

let transporter = null;
const getTransporter = () => {
    if (!transporter && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }
    return transporter;
};

export const sendEmail = async (to, subject, text) => {
    if (process.env.BREVO_API_KEY) {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sender: {
                    name: process.env.BREVO_SENDER_NAME || "HunarHub",
                    email: process.env.BREVO_SENDER_EMAIL
                },
                to: [
                    {
                        email: to
                    }
                ],
                subject,
                textContent: text
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Brevo email failed: ${error}`);
        }
        return;
    }

    const mailer = getTransporter();
    if (mailer) {
        await mailer.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            text
        });
        return;
    }

    console.warn("No email service configured (missing BREVO_API_KEY or SMTP credentials). Simulated sending to:", to);
};