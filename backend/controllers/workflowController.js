const Workflow = require("../models/Workflow");
const Step = require("../models/Step");
const Rule = require("../models/Rule");

exports.createWorkflow = async (req, res) => {
  const { name, input_schema } = req.body;
  const workflow = await Workflow.create({ name, input_schema, version: 1 });
  res.json(workflow);
};

exports.getWorkflows = async (req, res) => {
  const workflows = await Workflow.find();
  
  // Attach step count to each workflow for the UI list
  const workflowsWithStepCount = await Promise.all(workflows.map(async w => {
    const steps = await Step.countDocuments({ workflow_id: w._id });
    return { ...w._doc, steps };
  }));

  res.json(workflowsWithStepCount);
};

exports.getWorkflowById = async (req, res) => {
  const workflow = await Workflow.findById(req.params.id);
  if (!workflow) return res.status(404).json({ msg: "Workflow not found" });

  const steps = await Step.find({ workflow_id: workflow._id }).sort({ order: 1 });
  
  // Attach rules to each step for the Editor UI
  const stepsWithRules = await Promise.all(steps.map(async s => {
    const rules = await Rule.find({ step_id: s._id }).sort({ priority: 1 });
    return { ...s._doc, rules };
  }));

  res.json({ ...workflow._doc, steps: stepsWithRules });
};

exports.updateWorkflow = async (req, res) => {
  const { name, input_schema, start_step_id } = req.body;
  
  // Optionally increment version, but for simplicity we modify in-place
  const workflow = await Workflow.findByIdAndUpdate(
    req.params.id, 
    { name, input_schema, start_step_id, version: req.body.version || 1 },
    { new: true }
  );
  
  res.json(workflow);
};

exports.deleteWorkflow = async (req, res) => {
  await Workflow.findByIdAndDelete(req.params.id);
  res.json({ msg: "Workflow deleted" });
};
