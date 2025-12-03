const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create folder
const avatarPath = path.join(__dirname, "..", "uploads", "avatars");
if (!fs.existsSync(avatarPath)) {
  fs.mkdirSync(avatarPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarPath),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const filter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only images allowed"));
  }
  cb(null, true);
};

module.exports = multer({ storage, fileFilter: filter });
