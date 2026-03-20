const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");
const User = require("../models/User");

router.post("/login", login);

// Get leave balance for an employee
router.get("/balance/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ msg: "User not found" });
  res.json({ balance: user.leaveBalance });
});

module.exports = router;