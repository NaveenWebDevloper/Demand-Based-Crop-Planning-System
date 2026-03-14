const nodemailer = require("nodemailer");
const net = require('net');

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

        // Build SMTP transport using explicit host/port to allow IPv4-only socket
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
        const secure = smtpPort === 465;

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure,
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
            // Force SMTP connection sockets to use IPv4 (workaround for ENETUNREACH on IPv6-only environments)
            getSocket: (options, callback) => {
                try {
                    const socket = net.connect({ host: options.host, port: options.port, family: 4 }, () => callback(null, socket));
                    socket.on('error', (err) => callback(err));
                } catch (err) {
                    callback(err);
                }
            }
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
