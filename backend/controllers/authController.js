const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).json({ msg: "User not found" });

  const match = await bcrypt.compare(req.body.password, user.password);

  if (!match) return res.status(400).json({ msg: "Wrong password" });

  res.json({
    userId: user._id,
    role: user.role,
    leaveBalance: user.leaveBalance
  });
};