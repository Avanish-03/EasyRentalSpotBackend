const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist
} = require("../controllers/tenantWishlistController");

// POST /api/tenant/wishlist
router.post("/wishlist", auth(["Tenant"]), addToWishlist);

// DELETE /api/tenant/wishlist/:id
router.delete("/wishlist/:id", auth(["Tenant"]), removeFromWishlist);

// GET /api/tenant/wishlist
router.get("/wishlist", auth(["Tenant"]), getMyWishlist);

module.exports = router;
