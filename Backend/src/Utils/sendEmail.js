const nodemailer = require("nodemailer");

/**
 * Send an email
 * @param {Object} options Options containing to, subject, and html or text
 * @returns {Promise<Object>} Resolves {success: true} or {success: false, error: "..."}
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: `Demand-Based Crop Planning System <${process.env.SMTP_USER || 'no-reply@example.com'}>`,
            to,
            subject,
            html,
        };

        // If SMTP credentials are missing, fall back to a harmless JSON transport in non-production
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            const isProduction = process.env.NODE_ENV === 'production';
            console.warn('⚠️ SMTP credentials not configured.');
            if (isProduction) {
                return { success: false, error: 'SMTP credentials not configured on the server.' };
            }

            // Development fallback: use jsonTransport so emails are serialized to the logs
            const devTransporter = nodemailer.createTransport({ jsonTransport: true });
            const info = await devTransporter.sendMail(mailOptions);
            console.log('ℹ️ Simulated email (no SMTP):', info);
            return { success: true, simulated: true, info };
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

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent: %s', info.messageId);
        return { success: true };
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
        return { success: false, error: `SMTP Error: ${error.message}` };
    }
};

module.exports = sendEmail;
