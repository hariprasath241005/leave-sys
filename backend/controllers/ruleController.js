const Rule = require("../models/Rule");

exports.addRule = async (req, res) => {
  const { condition, next_step_id, priority } = req.body;
  const step_id = req.params.step_id;
  
  const rule = await Rule.create({
    step_id,
    condition,
    next_step_id,
    priority
  });
  
  res.json(rule);
};

exports.getRules = async (req, res) => {
  const rules = await Rule.find({ step_id: req.params.step_id }).sort({ priority: 1 });
  res.json(rules);
};

exports.updateRule = async (req, res) => {
  const rule = await Rule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(rule);
};

exports.deleteRule = async (req, res) => {
  await Rule.findByIdAndDelete(req.params.id);
  res.json({ msg: "Rule deleted" });
};
