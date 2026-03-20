const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema({
  step_id: { type: mongoose.Schema.Types.ObjectId, ref: "Step", required: true },
  condition: { type: String, required: true }, // e.g. "amount > 100" or "DEFAULT"
  next_step_id: { type: mongoose.Schema.Types.ObjectId, ref: "Step", default: null }, // null means end of workflow
  priority: { type: Number, default: 1 }, // Lower number = evaluated first
  is_reject: { type: Boolean, default: false } // marks terminal rejection rules
}, { timestamps: true });

module.exports = mongoose.model("Rule", ruleSchema);
