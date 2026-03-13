const UserModel = require("../Models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict",
    };
};

const registerUser = async (req, res) => {
  const { name, email, phone, address, password, profileImageUrl, profileImageId } = req.body;
    try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({
            $or: [{ email }, { phone }]
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email or phone already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare profile image object if provided
        const profileImageData = {};
        if (profileImageUrl) {
            profileImageData.url = profileImageUrl;
        }
        if (profileImageId) {
            profileImageData.imageId = profileImageId;
        }

        // Always set role as "farmer" and status as "pending" for regular registration
        const newUser = await UserModel.create({
            name,
            email,
            phone,
            address,
            password: hashedPassword,
            role: "farmer",
            status: "pending",
            ...(Object.keys(profileImageData).length > 0 && { profileImage: profileImageData })
        });

        // Don't issue token on registration - user must wait for admin approval
        return res.status(201).json({
            message: "Registration successful. Please wait for admin approval before logging in.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                status: newUser.status,
                profileImage: newUser.profileImage
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error occurred while registering user",
            error: err.message
        });
    }           
};

// Login controller

const LoginUser = async (req, res) => {
    // Always start from a clean auth cookie so stale sessions do not leak across logins.
    res.clearCookie("jwtToken", getCookieOptions());

    try {
        const { email, phone,  password } = req.body;

        // Find user by email or phone and ensure password field is selected
        const user = await UserModel.findOne({
            $or: [{ email }, { phone }], 
        }).select("+password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Check if user is approved by admin
        if (user.status === "pending") {
            return res.status(403).json({
                message: "Your account is pending approval. Please wait for admin approval."
            });
        }

        if (user.status === "rejected") {
            return res.status(403).json({
                message: "Your account has been rejected. Please contact support."
            });
        }

        const jwtToken = jwt.sign({id : user._id, role: user.role}, process.env.JWT_SECRET)
        res.cookie("jwtToken", jwtToken, getCookieOptions());

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                profileImage: user.profileImage
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error occurred while logging in",
            error: err.message
        });
    }
};

// Logout controller
const LogoutUser = (req, res) => {
    try {
        res.clearCookie("jwtToken", getCookieOptions());

        return res.status(200).json({
            message: "Logged out successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error occurred while logging out",
            error: err.message
        });
    }
};

// Get current user
const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                profileImage: user.profileImage
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching user",
            error: err.message
        });
    }
};

module.exports = { registerUser, LoginUser, LogoutUser, getMe };