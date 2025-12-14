// routes/adminUserRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
const ctrl = require("../controllers/adminUserController");

router.get("/", auth(), adminOnly, ctrl.getAllUsers);
router.get("/:id", auth(), adminOnly, ctrl.getUserById);
router.put("/:id", auth(), adminOnly, ctrl.updateUser);
router.put("/:id/block", auth(), adminOnly, ctrl.blockUser);
router.put("/:id/unblock", auth(), adminOnly, ctrl.unblockUser);
router.delete("/:id", auth(), adminOnly, ctrl.deleteUser);

module.exports = router;
