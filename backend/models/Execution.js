const mongoose = require("mongoose");

const executionSchema = new mongoose.Schema({
  workflow_id: { type: mongoose.Schema.Types.ObjectId, ref: "Workflow" },
  workflow_version: { type: Number, default: 1 },
  current_step_id: { type: mongoose.Schema.Types.ObjectId, ref: "Step" }, // tracking dynamic steps
  
  data: Object,
  status: { 
    type: String, 
    enum: ["pending", "in_progress", "completed", "failed", "canceled"],
    default: "in_progress" 
  },

  logs: [
    {
      step_name: String,
      step_type: String,
      action: String,
      role: String,
      evaluated_rules: Array, // [{rule: "amount > 100", result: true}]
      selected_next_step: mongoose.Schema.Types.ObjectId,
      status: String,
      error_message: String,
      started_at: { type: Date, default: Date.now },
      ended_at: Date
    }
  ],

  notifications: [{ message: String }],

  retries: { type: Number, default: 0 },
  triggered_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Execution", executionSchema);