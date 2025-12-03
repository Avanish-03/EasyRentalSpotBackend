const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Folder ensure
const uploadPath = path.join(__dirname, "..", "uploads", "properties");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// Filter
const filter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only jpeg, png, jpg allowed"));
  }
  cb(null, true);
};

module.exports = multer({ storage, fileFilter: filter });
