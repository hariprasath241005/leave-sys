const Step = require("../models/Step");

exports.addStep = async (req, res) => {
  const { name, step_type, order, metadata } = req.body;
  const workflow_id = req.params.workflow_id;
  
  const step = await Step.create({
    workflow_id,
    name,
    step_type,
    order,
    metadata
  });
  
  res.json(step);
};

exports.getSteps = async (req, res) => {
  const steps = await Step.find({ workflow_id: req.params.workflow_id }).sort({ order: 1 });
  res.json(steps);
};

exports.updateStep = async (req, res) => {
  const step = await Step.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(step);
};

exports.deleteStep = async (req, res) => {
  await Step.findByIdAndDelete(req.params.id);
  res.json({ msg: "Step deleted" });
};
