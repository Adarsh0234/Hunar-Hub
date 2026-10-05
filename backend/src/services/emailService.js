import nodemailer from "nodemailer";
import crypto from "crypto";

//creates a connection configuration (smtp server ) for sending emails
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});
//exports the sendEmail function which takes the recipient's email, subject, and body of the email as parameters
export const sendEmail = async (to, subject, text) => {
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text
    });
};