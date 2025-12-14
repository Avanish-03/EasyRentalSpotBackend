// middleware/adminOnly.js
// Usage: put after auth() middleware
module.exports = function (req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ success:false, message:"Unauthorized" });
    const role = (req.user.role || "").toString().toLowerCase();
    // req.user.role might be string (from token) or populated object elsewhere
    if (role !== "admin" && req.user.role?.name?.toLowerCase() !== "admin") {
      return res.status(403).json({ success:false, message:"Admin access required" });
    }
    next();
  } catch (err) {
    console.error("adminOnly err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};
