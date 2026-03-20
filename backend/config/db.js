const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is not set!");
    process.exit(1);
  }

  // Strip accidental angle brackets from Atlas URI copy
  const cleanUri = uri.replace(/<|>/g, "");

  console.log("Connecting to MongoDB...");

  try {
    await mongoose.connect(cleanUri, {
      tls: true,
      tlsAllowInvalidCertificates: true, // Fix for Atlas TLS compatibility on cloud hosts
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection FAILED:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;