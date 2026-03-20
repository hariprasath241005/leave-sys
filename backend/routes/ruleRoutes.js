const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/ruleController");

router.post("/steps/:step_id/rules", ctrl.addRule);
router.get("/steps/:step_id/rules", ctrl.getRules);

router.put("/rules/:id", ctrl.updateRule);
router.delete("/rules/:id", ctrl.deleteRule);

module.exports = router;
