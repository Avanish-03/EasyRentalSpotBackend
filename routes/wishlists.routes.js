const express = require('express');
const router = express.Router();
const wishlistsController = require('../controllers/wishlists.controller');

// CRUD routes
router.post('/', wishlistsController.createWishlist);
router.get('/', wishlistsController.getWishlists);
router.get('/:id', wishlistsController.getWishlistById);
router.put('/:id', wishlistsController.updateWishlist);
router.delete('/:id', wishlistsController.deleteWishlist);

module.exports = router;
