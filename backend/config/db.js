const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/leave_system";
  
  await mongoose.connect(uri, {
    tls: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4 // Force IPv4 to avoid IPv6 TLS issues on Render
  });
  
  console.log("MongoDB Connected");
};

module.exports = connectDB;