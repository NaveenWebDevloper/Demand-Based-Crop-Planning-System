const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const net = require('net');

/**
 * Send an email via SendGrid if configured, otherwise fall back to SMTP.
 * @param {Object} options Options containing to, subject, and html
 * @returns {Promise<Object>} Resolves {success: true} or {success: false, error: "..."}
 */
const sendEmail = async ({ to, subject, html }) => {
    // Prefer SendGrid API if available
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_SENDER) {
        try {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                to,
                from: process.env.SENDGRID_SENDER,
                subject,
                html,
            };
            const res = await sgMail.send(msg);
            console.log('✅ SendGrid email sent');
            return { success: true, provider: 'sendgrid', info: res };
        } catch (err) {
            console.error('❌ SendGrid send error:', err.message || err.toString());
            // Fall through to SMTP fallback
        }
    }

    // SMTP fallback (keeps IPv4 workaround for environments without IPv6)
    try {
        const mailOptions = {
            from: `Demand-Based Crop Planning System <${process.env.SMTP_USER || process.env.SENDGRID_SENDER || 'no-reply@example.com'}>`,
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
            connectionTimeout: 20000,
            greetingTimeout: 20000,
            socketTimeout: 30000,
            debug: true,
            logger: true,
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
        console.log('✅ SMTP email sent: %s', info.messageId);
        return { success: true, provider: 'smtp' };
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        return { success: false, error: `Email Error: ${error.message}` };
    }
};

module.exports = sendEmail;
