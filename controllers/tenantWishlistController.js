const Wishlist = require("../models/Wishlist");
const Property = require("../models/Property");

// Add to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { propertyId } = req.body;

    if (!propertyId)
      return res.status(400).json({ success: false, message: "propertyId required" });

    const exists = await Wishlist.findOne({ tenantId, propertyId });
    if (exists)
      return res.status(409).json({ success: false, message: "Already in wishlist" });

    const item = await Wishlist.create({ tenantId, propertyId });

    return res.json({ success: true, message: "Added to wishlist", item });
  } catch (err) {
    console.error("Add wishlist error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove from Wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { id } = req.params;

    const deleted = await Wishlist.findOneAndDelete({ tenantId, propertyId: id });

    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found in wishlist" });

    return res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    console.error("Remove wishlist error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get my wishlist
exports.getMyWishlist = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const items = await Wishlist.find({ tenantId })
      .populate({
        path: "propertyId",
        select: "title price status images locationId"
      })
      .sort("-createdAt");

    return res.json({ success: true, wishlist: items });
  } catch (err) {
    console.error("Get wishlist error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
