const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error("❌ MONGODB_URI is not set in environment variables!");
    process.exit(1);
  }

  // Sanitize: in case user copied with angle brackets like <password>
  const cleanUri = uri.replace(/<|>/g, "");

  console.log("Connecting to MongoDB...");

  try {
    await mongoose.connect(cleanUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;