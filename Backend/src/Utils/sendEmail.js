const nodemailer = require("nodemailer");

/**
 * Send an email
 * @param {Object} options Options containing to, subject, and html or text
 * @returns {Promise<boolean>} Resolves true if success, false otherwise
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn("⚠️ SMTP credentials not configured. Email will not be sent.");
            return false;
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `Demand-Based Crop Planning System <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
        return false;
    }
};

module.exports = sendEmail;
