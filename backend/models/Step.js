const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  workflow_id: { type: mongoose.Schema.Types.ObjectId, ref: "Workflow", required: true },
  name: { type: String, required: true },
  step_type: { 
    type: String, 
    enum: ["task", "approval", "notification"],
    required: true
  },
  order: { type: Number, default: 1 },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model("Step", stepSchema);
