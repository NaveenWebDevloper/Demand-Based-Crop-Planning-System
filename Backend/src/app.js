const express = require("express");
const authRoutes = require('./Routes/auth.Routes');
const adminRoutes = require('./Routes/admin.Routes');
const marketDemandRoutes = require('./Routes/Marketdemand.Routes');
const imageRoutes = require('./Routes/image.Routes');
const weatherRoutes = require('./Routes/weather.Routes');
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
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
].filter(Boolean);

// Allow local LAN addresses and localhost on any port
const lanOriginPattern = /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;
const localhostPattern = /^https?:\/\/((localhost)|(127\.0\.0\.1))(\:\d+)?$/i;
const vercelOriginPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
const renderOriginPattern = /^https:\/\/[a-z0-9-]+\.onrender\.com$/i;


// During development, allow all origins and echo the request Origin (helps local dev servers).
if (process.env.NODE_ENV !== 'production') {
    app.use(cors({ origin: true, credentials: true }));
} else {
    app.use(cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (configuredOrigins.includes(origin) || lanOriginPattern.test(origin) || localhostPattern.test(origin) || vercelOriginPattern.test(origin) || renderOriginPattern.test(origin)) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
    }));
}
// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Demand-Based Crop Planning System API is running' });
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market', marketDemandRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/weather', weatherRoutes);

module.exports = app;