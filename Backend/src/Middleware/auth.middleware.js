const jwt = require("jsonwebtoken");

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
    const token = req.cookies.jwtToken;
    
    if (!token) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
};

// Check user role middleware
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                message: "Access denied. User not authenticated."
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied. Insufficient permissions."
            });
        }

        next();
    };
};

module.exports = { verifyToken, checkRole };
