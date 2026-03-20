const mongoose = require("mongoose");
const configSchema = new mongoose.Schema({
  managerLimit: { type: Number, default: 3 },
  hrLimit: { type: Number, default: 5 },
  ceoLimit: { type: Number, default: 10 }
});
module.exports = mongoose.model("Config", configSchema);
