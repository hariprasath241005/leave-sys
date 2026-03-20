const express = require("express");
const router = express.Router({ mergeParams: true });
const ctrl = require("../controllers/stepController");

// The router is mounted at /api/workflows/:workflow_id/steps or directly at /api/steps
router.post("/workflows/:workflow_id/steps", ctrl.addStep);
router.get("/workflows/:workflow_id/steps", ctrl.getSteps);

router.put("/steps/:id", ctrl.updateStep);
router.delete("/steps/:id", ctrl.deleteStep);

module.exports = router;
