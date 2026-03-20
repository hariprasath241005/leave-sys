const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  leaveBalance: { type: Number, default: 20 }  // each employee starts with 20 days
});

module.exports = mongoose.model("User", userSchema);