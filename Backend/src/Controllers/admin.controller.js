const UserModel = require("../Models/user.model");

// Get all pending users (for admin dashboard)
const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await UserModel.find({ status: "pending" }).select("-password");
        
        return res.status(200).json({
            message: "Pending users retrieved successfully",
            count: pendingUsers.length,
            users: pendingUsers
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching pending users",
            error: err.message
        });
    }
};

// Get all users (for admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find({ role: { $eq: "farmer" } }).select("-password");
        
        return res.status(200).json({
            message: "Users retrieved successfully",
            count: users.length,
            users: users
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching users",
            error: err.message
        });
    }
};

// Approve a user
const approveUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.status === "approved") {
            return res.status(400).json({
                message: "User is already approved"
            });
        }

        user.status = "approved";
        await user.save();

        return res.status(200).json({
            message: "User approved successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                status: user.status
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error approving user",
            error: err.message
        });
    }
};

// Reject a user
const rejectUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.status === "rejected") {
            return res.status(400).json({
                message: "User is already rejected"
            });
        }

        user.status = "rejected";
        await user.save();

        return res.status(200).json({
            message: "User rejected successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                status: user.status
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error rejecting user",
            error: err.message
        });
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error deleting user",
            error: err.message
        });
    }
};

module.exports = { getPendingUsers, getAllUsers, approveUser, rejectUser, deleteUser };
