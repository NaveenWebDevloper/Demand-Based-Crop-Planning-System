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

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // Add timeouts to prevent hanging
            connectionTimeout: 20000, 
            greetingTimeout: 20000,
            socketTimeout: 30000,
            // Enable logging for Render logs
            debug: true,
            logger: true,
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
