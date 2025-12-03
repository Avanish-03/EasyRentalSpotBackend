const fs = require("fs");
const path = require("path");

module.exports = function deleteFile(filePath) {
  try {
    const fullPath = path.join(__dirname, "..", filePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (err) {
    console.log("Error deleting file:", err);
  }
};
