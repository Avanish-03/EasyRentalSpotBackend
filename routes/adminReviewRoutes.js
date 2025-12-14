//routes/adminReviewRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
const ctrl = require("../controllers/adminReviewController");

router.get("/", auth(), adminOnly, ctrl.getAllReviews);
router.get("/:id", auth(), adminOnly, ctrl.getReviewById);

router.delete("/:id", auth(), adminOnly, ctrl.deleteReview);

module.exports = router;
