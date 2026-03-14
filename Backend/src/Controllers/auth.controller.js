const UserModel = require("../Models/user.model");
const OTPModel = require("../Models/otp.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../Utils/sendEmail");

const getCookieOptions = () => {
    // Both Render and Vercel use HTTPS. 
    // Since they are on completely different domains, cookies MUST have SameSite: 'none' and Secure: true.
    return {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };
};

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to database (expires in 5 mins)
        await OTPModel.deleteMany({ email }); // delete old ones
        await OTPModel.create({ email, otp });

        // Send OTP via email
        const mailSent = await sendEmail({
            to: email,
            subject: "Your Email Verification OTP - Crop Planning System",
            html: `
                <h3>Email Verification</h3>
                <p>Your OTP for email verification is: <strong>${otp}</strong></p>
                <p>This code will expire in 5 minutes.</p>
            `,
        });

        if (!mailSent || !mailSent.success) {
            return res.status(500).json({ message: `Failed to send OTP email: ${mailSent.error || "Unknown server error"}` });
        }

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Error sending OTP", error: err.message });
    }
};

const registerUser = async (req, res) => {
  const { name, email, phone, address, password, profileImageUrl, profileImageId, otp } = req.body;
    try {
        if (!otp) {
            return res.status(400).json({ message: "OTP is required for registration" });
        }

        // Verify OTP
        const otpRecord = await OTPModel.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

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

        // Delete the used OTP
        await OTPModel.deleteMany({ email });

        // Add asynchronous email notification to admin(s)
        try {
            const adminUsers = await UserModel.find({ role: "admin" }).select("email");
            const adminEmails = adminUsers.map(admin => admin.email).join(",");
            
            if (adminEmails) {
                const subject = "New Farmer Registration - Awaiting Approval";
                const html = `
                    <h3>New Farmer Registration Pending</h3>
                    <p>A new farmer has registered and is waiting for your approval.</p>
                    <ul>
                        <li><strong>Name:</strong> ${newUser.name}</li>
                        <li><strong>Email:</strong> ${newUser.email}</li>
                        <li><strong>Phone:</strong> ${newUser.phone}</li>
                        <li><strong>Address:</strong> ${newUser.address}</li>
                    </ul>
                    <br/>
                    <p>Please login to the admin panel to review and approve the request.</p>
                `;
                
                const emailResult = await sendEmail({
                    to: adminEmails,
                    subject,
                    html
                });
                if (!emailResult.success) {
                    console.error("Failed to notify admins via email:", emailResult.error);
                }
            }
        } catch (emailErr) {
            console.error("Failed to notify admins via email:", emailErr.message);
        }

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

module.exports = { registerUser, LoginUser, LogoutUser, getMe, sendOtp };