//routes/tenantProfileRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const uploadAvatar = require("../middleware/uploadAvatar");
const {
  getTenantProfile,
  updateTenantProfile,
  updateTenantAvatar,
  changeTenantPassword
} = require("../controllers/tenantProfileController");

// GET profile
router.get("/", auth(["Tenant"]), getTenantProfile);

// UPDATE profile details
router.put("/", auth(["Tenant"]), updateTenantProfile);

// UPDATE avatar
router.put("/avatar", auth(["Tenant"]), uploadAvatar.single("avatar"), updateTenantAvatar);

// CHANGE password
router.put("/change-password", auth(["Tenant"]), changeTenantPassword);

module.exports = router;
