const UserModel = require("../Models/user.model");
const bcrypt = require("bcryptjs");

const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await UserModel.findOne({ email: "admin@cropplan.com" });
    
    if (adminExists) {
      // Update admin password to ensure it's correct
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await UserModel.updateOne(
        { email: "admin@cropplan.com" },
        { password: hashedPassword, role: "admin", status: "approved" }
      );
      console.log("✅ Default admin password updated");
      console.log("   Email: admin@cropplan.com");
      console.log("   Password: admin123");
      return;
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const admin = await UserModel.create({
      name: "Admin",
      email: "admin@cropplan.com",
      phone: "9999999999",
      address: "CropPlan Headquarters",
      password: hashedPassword,
      role: "admin",
      status: "approved"
    });

    console.log("✅ Default admin created successfully");
    console.log("   Email: admin@cropplan.com");
    console.log("   Password: admin123");
    
  } catch (error) {
    console.error("❌ Error creating default admin:", error.message);
  }
};

module.exports = createDefaultAdmin;
