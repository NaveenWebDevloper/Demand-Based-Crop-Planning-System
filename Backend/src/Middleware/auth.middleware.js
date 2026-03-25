const jwt = require("jsonwebtoken");

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
    let token = req.cookies.jwtToken;

    // Check Authorization header (commonly used by mobile apps)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
        console.log("Token received from Authorization Header");
    } else if (token) {
        console.log("Token received from Cookies");
    }
    
    if (!token) {
        console.log("❌ No token found in request to:", req.originalUrl);
        console.log("Current Cookies:", req.cookies);

        return res.status(401).json({
            message: "Access denied. Authentication token is missing."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log(`✅ verifyToken success for user ID: ${decoded.id}, Role: ${decoded.role}`);
        next();
    } catch (err) {
        console.log("❌ verifyToken failed (Invalid/Expired token):", err.message);
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
};

// Check user role middleware
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            console.log("❌ checkRole failed: req.user or role missing");
            return res.status(401).json({
                message: "Access denied. User not authenticated."
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            console.log(`❌ checkRole failed: User role '${req.user.role}' not in allowed roles:`, allowedRoles);
            return res.status(403).json({
                message: "Access denied. Insufficient permissions."
            });
        }

        console.log(`✅ checkRole passed: User role '${req.user.role}' authorized.`);
        next();
    };
};

module.exports = { verifyToken, checkRole };
