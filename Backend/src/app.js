const express = require("express");
const authRoutes = require('./Routes/auth.Routes');
const adminRoutes = require('./Routes/admin.Routes');
const marketDemandRoutes = require('./Routes/Marketdemand.Routes');
const imageRoutes = require('./Routes/image.Routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const configuredOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
].filter(Boolean);

const lanOriginPattern = /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;
const vercelOriginPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || configuredOrigins.includes(origin) || lanOriginPattern.test(origin) || vercelOriginPattern.test(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market', marketDemandRoutes);
app.use('/api/image', imageRoutes);

module.exports = app;