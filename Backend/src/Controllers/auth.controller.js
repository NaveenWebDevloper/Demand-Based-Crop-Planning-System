const UserModel = require("../Models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        // Require secure/HTTPS in production, allow HTTP in local development
        secure: isProduction,
        // If not secure, sameSite MUST be 'lax' or 'strict' since 'none' requires secure
        sameSite: isProduction ? "none" : "lax",
    };
};

// ── Register ────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  const { name, email, phone, address, password, profileImageUrl, profileImageId, profileImage } = req.body;
  try {
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phone }]
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileImageData = {};
    
    // Support both ways (object or flat fields)
    if (profileImage && profileImage.url) profileImageData.url = profileImage.url;
    if (profileImage && profileImage.imageId) profileImageData.imageId = profileImage.imageId;
    if (profileImageUrl) profileImageData.url = profileImageUrl;
    if (profileImageId) profileImageData.imageId = profileImageId;

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

    return res.status(201).json({
      message: "Registration successful. Please wait for admin approval.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        status: newUser.status,
        profileImage: newUser.profileImage
      }
    });
  } catch (err) {
    console.error("❌ Registration Error:", err);

    // Handle MongoDB duplicate key error (E11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        message: `User with this ${field} already exists. Please use a different ${field}.`,
      });
    }

    return res.status(500).json({
      message: "Error occurred while registering user",
      error: err.message
    });
  }

};

// ── Login ───────────────────────────────────────────────────────────────────
const LoginUser = async (req, res) => {
    res.clearCookie("jwtToken", getCookieOptions());

    try {
        const { email, phone,  password } = req.body;

        const user = await UserModel.findOne({
            $or: [{ email }, { phone }], 
        }).select("+password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

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
            token: jwtToken,
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

// ── Logout ──────────────────────────────────────────────────────────────────
const LogoutUser = (req, res) => {
    try {
        res.clearCookie("jwtToken", getCookieOptions());
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Error occurred while logging out", error: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, address, profileImage } = req.body;
        const userId = req.user.id;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (profileImage && profileImage.url) {
            user.profileImage = {
                url: profileImage.url,
                imageId: profileImage.imageId
            };
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
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
            message: "Error updating profile",
            error: err.message
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

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
        return res.status(500).json({ message: "Error fetching user", error: err.message });
    }
};

module.exports = { registerUser, LoginUser, LogoutUser, getMe, updateProfile };