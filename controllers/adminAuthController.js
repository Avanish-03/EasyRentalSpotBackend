// controllers/adminAuthController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/admin/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message:"Email & password required" });

    const user = await User.findOne({ email }).populate("role", "name");
    if (!user) return res.status(400).json({ success:false, message:"Invalid credentials" });

    // ensure admin role
    const roleName = (user.role && user.role.name) || user.role || "";
    if (roleName.toLowerCase() !== "admin") {
      return res.status(403).json({ success:false, message:"Not an admin account" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success:false, message:"Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: "Admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // return minimal user info (no password)
    const safeUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: "Admin",
      avatar: user.avatar || null
    };

    res.json({ success:true, token, user: safeUser });
  } catch (err) {
    console.error("Admin login err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// GET /api/admin/auth/me
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("role","name");
    if (!user) return res.status(404).json({ success:false, message:"User not found" });

    // ensure admin
    const roleName = (user.role && user.role.name) || user.role || "";
    if (roleName.toLowerCase() !== "admin") return res.status(403).json({ success:false, message:"Forbidden" });

    res.json({ success:true, user });
  } catch (err) {
    console.error("Admin getProfile err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// PUT /api/admin/auth/me
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ["fullName","email","phone","avatar"];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    // if email changed, ensure unique
    if (updates.email) {
      const exist = await User.findOne({ email: updates.email, _id: { $ne: req.user.id } });
      if (exist) return res.status(400).json({ success:false, message:"Email already in use" });
    }

    const updated = await User.findByIdAndUpdate(req.user.id, updates, { new:true }).select("-password");
    res.json({ success:true, user: updated });
  } catch (err) {
    console.error("Admin updateProfile err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// PUT /api/admin/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ success:false, message:"Old & new password required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success:false, message:"User not found" });

    // ensure admin
    const roleName = (user.role && user.role.name) || user.role || "";
    if (roleName.toLowerCase() !== "admin") return res.status(403).json({ success:false, message:"Forbidden" });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ success:false, message:"Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success:true, message:"Password updated" });
  } catch (err) {
    console.error("Admin changePassword err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};
