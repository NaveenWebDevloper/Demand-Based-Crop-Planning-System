require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/DB/db");
const createDefaultAdmin = require("./src/Utils/createDefaultAdmin");
require("./src/Services/market.service");

// Connect to MongoDB and create default admin
const startServer = async () => {
  await connectDB();
  await createDefaultAdmin();
};

// For Vercel serverless deployment, export the app
if (process.env.VERCEL) {
  startServer().then(() => {
    console.log("Database connected and admin created for Vercel");
  });
  module.exports = app;
} else {
  // For local development
  startServer().then(() => {
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';
    
    app.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
    });
  }).catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });

}

