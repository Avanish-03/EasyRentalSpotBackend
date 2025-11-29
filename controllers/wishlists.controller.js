const Wishlist = require('../models/Wishlist');

// Create Wishlist item
exports.createWishlist = async (req, res) => {
  try {
    const { userId, propertyId } = req.body;

    const existingItem = await Wishlist.findOne({ userId, propertyId });
    if (existingItem) return res.status(400).json({ message: "Property already in wishlist" });

    const wishlistItem = new Wishlist({ userId, propertyId });
    await wishlistItem.save();

    res.status(201).json({ message: "Added to wishlist", wishlistItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Wishlist items
exports.getWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find()
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title');
    res.status(200).json(wishlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Wishlist item by ID
exports.getWishlistById = async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findById(req.params.id)
      .populate('userId', 'fullName email')
      .populate('propertyId', 'title');
    if (!wishlistItem) return res.status(404).json({ message: "Wishlist item not found" });
    res.status(200).json(wishlistItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Wishlist item
exports.updateWishlist = async (req, res) => {
  try {
    const updates = req.body;
    const wishlistItem = await Wishlist.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!wishlistItem) return res.status(404).json({ message: "Wishlist item not found" });

    res.status(200).json({ message: "Wishlist updated", wishlistItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Wishlist item
exports.deleteWishlist = async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findByIdAndDelete(req.params.id);
    if (!wishlistItem) return res.status(404).json({ message: "Wishlist item not found" });

    res.status(200).json({ message: "Wishlist item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
