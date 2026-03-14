const express = require("express");
const { registerUser, LoginUser, LogoutUser, getMe } = require("../Controllers/auth.controller");
const { verifyToken } = require("../Middleware/auth.middleware");

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', LoginUser);
router.post('/logout', LogoutUser);
router.get('/me', verifyToken, getMe);

module.exports = router;