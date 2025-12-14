//routes/adminReportRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
const ctrl = require("../controllers/adminReportController");

router.get("/", auth(), adminOnly, ctrl.getAllReports);
router.get("/:id", auth(), adminOnly, ctrl.getReportById);

router.put("/:id/status", auth(), adminOnly, ctrl.updateReportStatus);

router.delete("/:id", auth(), adminOnly, ctrl.deleteReport);

module.exports = router;
