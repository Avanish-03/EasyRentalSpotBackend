// routes/tenantVisitRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/tenantVisitController");

// Tenant visit actions (auth required)
router.post("/visits", auth(["Tenant"]), ctrl.createVisitRequest);
router.get("/visits", auth(["Tenant"]), ctrl.getMyVisits);
router.get("/visits/:id", auth(["Tenant"]), ctrl.getVisitById);
router.put("/visits/:id/cancel", auth(["Tenant"]), ctrl.cancelVisit);

module.exports = router;
