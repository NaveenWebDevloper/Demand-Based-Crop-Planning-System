const UserModel = require("../Models/user.model");
const bcrypt = require("bcryptjs");

const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@cropplan.com";
    const adminPhone = "0000000000";
    
    let admin = await UserModel.findOne({ role: "admin" });

    if (admin) {
      // Update existing admin if needed
      admin.name = "Naveen";
      admin.email = adminEmail;
      admin.status = "approved";
      await admin.save();
      console.log("Default admin updated successfully");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "naveen", 10);

    await UserModel.create({
      name: "Naveen",
      email: adminEmail,
      phone: adminPhone,
      address: "System Headquarters",
      password: hashedPassword,
      role: "admin",
      status: "approved"
    });

    console.log("Default admin created successfully");
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};

module.exports = createDefaultAdmin;
