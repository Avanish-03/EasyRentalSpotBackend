const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createVisit,
  getMyVisits,
  getVisitById,
  cancelVisit
} = require("../controllers/tenantVisitController");

// POST /api/tenant/visits
router.post("/visits", auth(["Tenant"]), createVisit);

// GET /api/tenant/visits
router.get("/visits", auth(["Tenant"]), getMyVisits);

// GET /api/tenant/visits/:id
router.get("/visits/:id", auth(["Tenant"]), getVisitById);

// PUT /api/tenant/visits/:id/cancel
router.put("/visits/:id/cancel", auth(["Tenant"]), cancelVisit);

module.exports = router;
