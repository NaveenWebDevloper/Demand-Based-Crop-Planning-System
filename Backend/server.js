require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/DB/db");
const createDefaultAdmin = require("./src/Utils/createDefaultAdmin");

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

