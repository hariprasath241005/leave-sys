const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    process.stderr.write("❌ MONGODB_URI is not set!\n");
    process.exit(1);
  }

  // Strip accidental angle brackets from Atlas URI copy
  const cleanUri = uri.replace(/<|>/g, "");
  const isAtlas = cleanUri.includes("mongodb+srv");

  console.log("Connecting to MongoDB...");

  try {
    const options = isAtlas
      ? {
          tls: true,
          tlsAllowInvalidCertificates: true,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          family: 4
        }
      : {
          serverSelectionTimeoutMS: 5000
        };

    await mongoose.connect(cleanUri, options);
    console.log("MongoDB Connected");
  } catch (err) {
    process.stderr.write("❌ MongoDB connection FAILED: " + err.message + "\n");
    process.exit(1);
  }
};

module.exports = connectDB;