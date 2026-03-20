const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: Number, default: 1 },
  is_active: { type: Boolean, default: true },
  input_schema: { type: Object, default: {} },
  start_step_id: { type: mongoose.Schema.Types.ObjectId, ref: "Step" }
}, { timestamps: true });

module.exports = mongoose.model("Workflow", workflowSchema);
