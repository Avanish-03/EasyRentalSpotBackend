const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadAvatar");
const controller = require("../controllers/profileController");

router.get("/", auth(), controller.getProfile);
router.put("/", auth(), controller.updateProfile);
router.put("/avatar", auth(), upload.single("avatar"), controller.updateAvatar);
router.put("/password", auth(), controller.changePassword);

module.exports = router;
