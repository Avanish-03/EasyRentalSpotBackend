// routes/tenantPropertyRoutes.js
const router = require("express").Router();
const tenantCtrl = require("../controllers/tenantPropertyController");
const auth = require("../middleware/authMiddleware"); // optional for some endpoints

// public list & filters
router.get("/properties", tenantCtrl.getProperties);
router.get("/properties/filters", tenantCtrl.getFilterLists);
router.get("/properties/:id", tenantCtrl.getPropertyById);
router.get("/properties/:id/similar", tenantCtrl.getSimilarProperties);

module.exports = router;
