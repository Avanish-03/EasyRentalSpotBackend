//routes/adminPropertyRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
const ctrl = require("../controllers/adminPropertyController");

router.get("/", auth(), adminOnly, ctrl.getAllProperties);
router.get("/:id", auth(), adminOnly, ctrl.getPropertyById);

router.put("/:id/approve", auth(), adminOnly, ctrl.approveProperty);
router.put("/:id/reject", auth(), adminOnly, ctrl.rejectProperty);

router.put("/:id/status", auth(), adminOnly, ctrl.togglePropertyStatus);

router.delete("/:id", auth(), adminOnly, ctrl.deleteProperty);

module.exports = router;
