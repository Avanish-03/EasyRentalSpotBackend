//propertyRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const controller = require("../controllers/propertyController");

// Owner CRUD
router.post("/", auth(["Owner"]), controller.createProperty);
router.put("/:id", auth(["Owner"]), controller.updateProperty);
router.delete("/:id", auth(["Owner"]), controller.deleteProperty);

// Images
router.post(
  "/upload/:propertyId",
  auth(["Owner"]),
  upload.array("images", 10),
  controller.uploadImages
);

router.delete("/image/:imageId", auth(["Owner"]), controller.deleteImage);

// Fetch
router.get("/owner/all", auth(["Owner"]), controller.getOwnerProperties);
router.get("/:id", controller.getSingleProperty);

module.exports = router;
