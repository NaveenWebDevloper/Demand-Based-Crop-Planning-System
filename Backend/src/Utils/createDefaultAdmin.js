const UserModel = require("../Models/user.model");
const bcrypt = require("bcryptjs");

const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await UserModel.findOne({ email: "23uj1a6648@mrem.ac.in" });
    
    if (adminExists) {
      // Update admin password to ensure it's correct
      const hashedPassword = await bcrypt.hash("naveen", 10);
      await UserModel.updateOne(
        { email: "23uj1a6648@mrem.ac.in" },
        { password: hashedPassword, role: "admin", status: "approved" }
      );
      console.log("✅ Default admin password updated");
      console.log("   Email: 23uj1a6648@mrem.ac.in");
      console.log("   Password: naveen");
      return;
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash("naveen", 10);
    
    const admin = await UserModel.create({
      name: "Admin",
      email: "23uj1a6648@mrem.ac.in",
      phone: "9999999999",
      address: "CropPlan Headquarters",
      password: hashedPassword,
      role: "admin",
      status: "approved"
    });

    console.log("✅ Default admin created successfully");
    console.log("   Email: 23uj1a6648@mrem.ac.in");
    console.log("   Password: naveen");
    
  } catch (error) {
    console.error("❌ Error creating default admin:", error.message);
  }
};

module.exports = createDefaultAdmin;
