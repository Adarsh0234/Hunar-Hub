export const sendEmail = async (to, subject, text) => {
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
};