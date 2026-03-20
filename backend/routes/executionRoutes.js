const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/executionController");

//  CORRECT (pass function reference)
router.post("/start", ctrl.startExecution);
router.post("/workflows/:workflow_id/execute", ctrl.startExecution);
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getExecutionById);
router.post("/process", ctrl.processStep); // legacy path used by frontend dashboards
router.post("/:id/cancel", ctrl.cancelExecution);

module.exports = router;