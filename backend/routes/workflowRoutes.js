const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/workflowController");

router.post("/", ctrl.createWorkflow);
router.get("/", ctrl.getWorkflows);
router.get("/:id", ctrl.getWorkflowById);
router.put("/:id", ctrl.updateWorkflow);
router.delete("/:id", ctrl.deleteWorkflow);

module.exports = router;
