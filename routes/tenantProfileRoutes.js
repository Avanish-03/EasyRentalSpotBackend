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
router.get("/", auth, getTenantProfile);

// UPDATE profile details
router.put("/", auth, updateTenantProfile);

// UPDATE avatar
router.put("/avatar", auth, uploadAvatar.single("avatar"), updateTenantAvatar);

// CHANGE password
router.put("/change-password", auth, changeTenantPassword);

module.exports = router;
