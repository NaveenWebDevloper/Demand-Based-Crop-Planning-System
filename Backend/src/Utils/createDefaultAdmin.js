const UserModel = require("../Models/user.model");
const bcrypt = require("bcryptjs");

const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists by email, name, or role
    const adminExists = await UserModel.findOne({
      $or: [
        { email: "23uj1a6648@mrem.ac.in" },
        { name: "Admin" },
        { role: "admin" }
      ]
    });
    
    if (adminExists) {
      // Update admin credentials to ensure they are correct
      const hashedPassword = await bcrypt.hash("naveen", 10);
      await UserModel.updateOne(
        { _id: adminExists._id },
        { 
          email: "23uj1a6648@mrem.ac.in",
          name: "Naveen",
          password: hashedPassword, 
          role: "admin", 
          status: "approved" 
        }
      );
      console.log("✅ Default admin credentials updated");
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
