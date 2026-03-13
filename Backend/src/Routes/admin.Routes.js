const express = require("express");
const { verifyToken, checkRole } = require("../Middleware/auth.middleware");
const { 
    getPendingUsers, 
    getAllUsers, 
    approveUser, 
    rejectUser, 
    deleteUser 
} = require("../Controllers/admin.controller");

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken);
router.use(checkRole("admin"));

// Get all pending users
router.get('/pending-users', getPendingUsers);

// Get all users
router.get('/users', getAllUsers);

// Approve a user
router.patch('/approve/:userId', approveUser);

// Reject a user
router.patch('/reject/:userId', rejectUser);

// Delete a user
router.delete('/user/:userId', deleteUser);

module.exports = router;
