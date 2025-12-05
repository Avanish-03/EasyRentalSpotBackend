// routes/tenantReviewRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/tenantReviewController");

// Add/update/delete review (auth required)
router.post("/reviews", auth(["Tenant"]), ctrl.addReview);
router.put("/reviews/:id", auth(["Tenant"]), ctrl.updateReview);
router.delete("/reviews/:id", auth(["Tenant"]), ctrl.deleteReview);
router.get("/reviews/my", auth(["Tenant"]), ctrl.getMyReviews);

// Public reviews of a property
router.get("/reviews/property/:propertyId", ctrl.getPropertyReviews);

module.exports = router;
