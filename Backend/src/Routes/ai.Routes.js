const express = require("express");
const router = express.Router();
const aiController = require("../Controllers/ai.controller");
const authMiddleware = require("../Middleware/auth.middleware");

// Handle AI queries from farmers (Require authentication)
router.post("/ask", authMiddleware.verifyToken, aiController.getAIResponse);


module.exports = router;
