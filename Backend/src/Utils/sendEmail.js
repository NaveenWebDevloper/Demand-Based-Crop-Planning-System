const nodemailer = require("nodemailer");

/**
 * Send an email
 * @param {Object} options Options containing to, subject, and html or text
 * @returns {Promise<Object>} Resolves {success: true} or {success: false, error: "..."}
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn("⚠️ SMTP credentials not configured. Email will not be sent.");
            return { success: false, error: "SMTP credentials not configured on the server." };
        }

        const port = Number(process.env.SMTP_PORT) || 587;
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: port,
            secure: port === 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // Add timeouts to prevent hanging on cloud platforms
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 15000,
        });

        const mailOptions = {
            from: `Demand-Based Crop Planning System <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent: %s", info.messageId);
        return { success: true };
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
        return { success: false, error: `SMTP Error: ${error.message}` };
    }
};

module.exports = sendEmail;
