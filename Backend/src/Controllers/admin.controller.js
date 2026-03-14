const UserModel = require("../Models/user.model");
const sendEmail = require("../Utils/sendEmail");

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

        // Send approval email to farmer (asynchronously)
        if (user.email) {
            const subject = "Account Approved - Crop Planning System";
            const html = `
                <h3>Congratulations, ${user.name}!</h3>
                <p>Your account has been successfully approved by the admin.</p>
                <p>You can now log in to the system to start planning your crops.</p>
                <br/>
                <p>Best regards,<br/>Demand-Based Crop Planning System</p>
            `;
            sendEmail({
                to: user.email,
                subject,
                html
            }).then(result => {
                if (!result.success) console.error("Failed to send approval email:", result.error);
            }).catch(err => console.error("Failed to send approval email:", err.message));
        }

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
