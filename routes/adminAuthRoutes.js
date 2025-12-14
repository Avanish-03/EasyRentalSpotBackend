// routes/adminAuthRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware"); // existing generic auth middleware that populates req.user
const adminOnly = require("../middleware/adminOnly");
const controller = require("../controllers/adminAuthController");

// Public: admin login
router.post("/login", controller.login);

// Protected: get profile, update, change password
router.get("/me", auth(), adminOnly, controller.getProfile);
router.put("/me", auth(), adminOnly, controller.updateProfile);
router.put("/change-password", auth(), adminOnly, controller.changePassword);

module.exports = router;
