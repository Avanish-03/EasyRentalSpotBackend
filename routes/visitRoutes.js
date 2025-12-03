// routes/visitRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const visitController = require("../controllers/visitController");

// Tenant schedules a visit
router.post("/", auth(["Tenant"]), visitController.createVisit);

// Get a visit (visitor/owner/admin)
router.get("/:id", auth(), visitController.getVisitById);

module.exports = router;
