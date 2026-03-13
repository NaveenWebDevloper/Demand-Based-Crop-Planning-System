require("dotenv").config({ path: "../.env" });
const app = require("./app");
const connectDB = require("./DB/db");
const createDefaultAdmin = require("./Utils/createDefaultAdmin");

// Connect to MongoDB and create default admin
const startServer = async () => {
  await connectDB();
  await createDefaultAdmin();
  
  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || '0.0.0.0';
  
  app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
};

startServer();

