const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const Config = require("./models/Config");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/config", require("./routes/configRoutes"));
app.use("/api/execution", require("./routes/executionRoutes"));
app.use("/api/workflows", require("./routes/workflowRoutes"));
app.use("/api", require("./routes/stepRoutes"));
app.use("/api", require("./routes/ruleRoutes"));

const Workflow = require("./models/Workflow");
const Step = require("./models/Step");
const Rule = require("./models/Rule");

async function seed() {
  const users = [
    { email: "employee@gmail.com", role: "employee" },
    { email: "manager@gmail.com", role: "manager" },
    { email: "hr@gmail.com", role: "hr" },
    { email: "ceo@gmail.com", role: "ceo" }
  ];

  for (let u of users) {
    const exist = await User.findOne({ email: u.email });
    if (!exist) {
      const hash = await bcrypt.hash("1234", 10);
      await User.create({ ...u, password: hash });
    }
  }

  const configExist = await Config.findOne();
  if (!configExist) {
    await Config.create({ managerLimit: 3, hrLimit: 5, ceoLimit: 10 });
  }

  // Seed Generic Workflow if it doesn't exist
  const wfExist = await Workflow.findOne({ name: "Leave Engine Architecture" });
  if (!wfExist) {
    const wf = await Workflow.create({
      name: "Leave Engine Architecture",
      input_schema: { leave_days: { type: "number", required: true } }
    });

    // Create steps conforming exactly to the user diagram
    const stManager = await Step.create({ workflow_id: wf._id, name: "Manager Check", step_type: "task", order: 1 });
    const stCEOAuto = await Step.create({ workflow_id: wf._id, name: "CEO auto-approve", step_type: "task", order: 2 });
    const stHR = await Step.create({ workflow_id: wf._id, name: "HR Check", step_type: "task", order: 3 });
    const stCEOManual = await Step.create({ workflow_id: wf._id, name: "CEO Approves", step_type: "approval", order: 4, metadata: { assignee_role: "ceo" } });

    // Rules for Manager Check (uses Config dynamic context variable!)
    await Rule.create({ step_id: stManager._id, condition: "leave_days <= config.managerLimit", next_step_id: stCEOAuto._id, priority: 1 });
    await Rule.create({ step_id: stManager._id, condition: "DEFAULT", next_step_id: stHR._id, priority: 2 }); // Escalates to HR Check

    // Rules for CEO Auto Approve (Completes immediately)
    await Rule.create({ step_id: stCEOAuto._id, condition: "DEFAULT", next_step_id: null, priority: 1 });

    // Rules for HR Check (uses Config dynamic context variable!)
    await Rule.create({ step_id: stHR._id, condition: "leave_days <= config.hrLimit", next_step_id: stCEOManual._id, priority: 1 });
    await Rule.create({ step_id: stHR._id, condition: "leave_days > config.hrLimit", next_step_id: null, priority: 2, is_reject: true }); // Rejects workflow
    await Rule.create({ step_id: stHR._id, condition: "DEFAULT", next_step_id: null, priority: 3, is_reject: true });

    // Rules for CEO Manual Approves (Waits for human 'action')
    await Rule.create({ step_id: stCEOManual._id, condition: "action == 'reject'", next_step_id: null, priority: 1 });
    await Rule.create({ step_id: stCEOManual._id, condition: "action == 'approve'", next_step_id: null, priority: 2 });

    wf.start_step_id = stManager._id;
    await wf.save();
    console.log("✅ Seeded Generic Workflow Engine using defined exact diagram");
  }
}

async function start() {
  await connectDB();
  await seed();
  app.listen(5000, () => console.log("Server running"));
}

start();