const Execution = require("../models/Execution");
const Workflow = require("../models/Workflow");
const Step = require("../models/Step");
const Rule = require("../models/Rule");
const User = require("../models/User");
const Config = require("../models/Config");
const jexl = require("jexl");

async function advanceEngine(exec, actionContext = {}, triggeredByUser = false) {
  let stable = false;

  const config = await Config.findOne();

  while (exec.status === "in_progress" && exec.current_step_id && !stable) {
    const currentStep = await Step.findById(exec.current_step_id);
    if (!currentStep) break;

    // Pause if human approval required and no manual action provided in this loop iteration
    if (currentStep.step_type === "approval" && !actionContext.action) {
      exec.notifications.push({ message: `⏸️ Workflow waiting at manual step: ${currentStep.name}` });
      stable = true; // wait for REST API
      break;
    }

    const rules = await Rule.find({ step_id: currentStep._id }).sort({ priority: 1 });
    let nextStepId = null;
    let selectedRule = null;
    const context = { ...exec.data, ...actionContext, config };

    for (let rule of rules) {
      let isMatch = false;
      if (rule.condition === "DEFAULT") {
         isMatch = true;
      } else {
         try { isMatch = await jexl.eval(rule.condition, context); } 
         catch (e) { isMatch = false; }
      }

      exec.logs.push({ step_name: currentStep.name, action: "evaluating rule", evaluated_rules: [{rule: rule.condition, result: isMatch}] });

      if (isMatch) {
         nextStepId = rule.next_step_id;
         selectedRule = rule;
         break;
      }
    }

    let newStatus = "in_progress";
    let stepLogStatus = "completed";

    if (!selectedRule) {
      newStatus = "failed";
      stepLogStatus = "failed";
    } else if (nextStepId === null) {
      // explicit reject: either the user sent action=reject, or the rule is tagged as a rejection terminal
      const isExplicitReject = actionContext.action === "reject";
      const isRejectRule = selectedRule.is_reject === true;

      newStatus = (isExplicitReject || isRejectRule) ? "rejected" : "completed";
      stepLogStatus = newStatus;

      if (newStatus === "completed" && exec.triggered_by && exec.data.leave_days) {
        const empl = await User.findById(exec.triggered_by);
        if (empl) {
          empl.leaveBalance -= exec.data.leave_days;
          await empl.save();
          exec.notifications.push({ message: `📋 Leave balance updated: ${empl.leaveBalance} days remaining.` });
        }
      }
    }

    exec.logs.push({
      step_name: currentStep.name,
      step_type: currentStep.step_type,
      action: actionContext.action || "auto-evaluated",
      role: actionContext.role || "system",
      selected_next_step: nextStepId,
      status: stepLogStatus
    });

    // Map step name to a human-readable approver label
    const approverLabel =
      currentStep.name === "Manager Check" || currentStep.name === "Manager Approval" ? "✅ Manager"
      : currentStep.name === "CEO auto-approve" ? "✅ CEO (Auto)"
      : currentStep.name === "HR Check" || currentStep.name === "HR Approval" ? "✅ HR"
      : currentStep.name === "CEO Approves" || currentStep.name === "CEO Approval" ? "✅ CEO"
      : currentStep.name;

    exec.current_step_id = nextStepId;
    exec.status = newStatus;

    if (newStatus === "completed") {
      exec.notifications.push({ message: `${approverLabel} approved the leave request. Workflow completed ✅` });
    }
    if (newStatus === "rejected") {
      exec.notifications.push({ message: `❌ ${currentStep.name} rejected the leave request. Workflow ended.` });
    }
    if (newStatus === "in_progress" && nextStepId) {
      exec.notifications.push({ message: `${approverLabel} processed step. Moving to next stage...` });
    }

    // clear human action context so it doesn't automatically approve subsequent approval steps!
    actionContext = {};
    await exec.save();
  }
}

// Start a new execution
exports.startExecution = async (req, res) => {
  try {
    const { workflow_id } = req.params || req.body;
    let workflow = workflow_id ? await Workflow.findById(workflow_id) : await Workflow.findOne({ name: "Leave Engine Architecture" });
    if (!workflow) return res.status(404).json({ msg: "Workflow not found" });

    const { leave_days, userId } = req.body;
    if (userId) {
      const employee = await User.findById(userId);
      if (leave_days && employee && employee.leaveBalance < leave_days) {
        return res.status(400).json({ msg: "Insufficient balance." });
      }
    }

    const exec = await Execution.create({
      workflow_id: workflow._id,
      workflow_version: workflow.version,
      current_step_id: workflow.start_step_id,
      data: req.body,
      status: "in_progress",
      logs: [],
      notifications: [{ message: `🚀 Started Workflow: ${workflow.name}` }],
      triggered_by: userId || null
    });

    // Auto-Advance engine!
    await advanceEngine(exec, {}, true);
    res.json(exec);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Process current step manually
exports.processStep = async (req, res) => {
  try {
    const { executionId, action, role } = req.body;
    const exec = await Execution.findById(executionId);
    if (!exec) return res.status(404).json({ msg: "Not found" });
    
    // Engine advances step with explicit manual constraints passed in
    await advanceEngine(exec, { action, role }, true);
    
    // fetch updated record
    const updated = await Execution.findById(executionId);
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAll = async (req, res) => { res.json(await Execution.find().sort({ _id: -1 })); };
exports.getExecutionById = async (req, res) => { res.json(await Execution.findById(req.params.id)); };
exports.cancelExecution = async (req, res) => { res.json(await Execution.findByIdAndUpdate(req.params.id, { status: "canceled" }, { new: true })); };