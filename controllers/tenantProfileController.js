const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET tenant profile
exports.getTenantProfile = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const user = await User.findById(tenantId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });

  } catch (err) {
    console.error("Get Tenant Profile Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE tenant basic details
exports.updateTenantProfile = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { fullName, phone } = req.body;

    const updated = await User.findByIdAndUpdate(
      tenantId,
      { fullName, phone },
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updated });

  } catch (err) {
    console.error("Update Tenant Profile Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE profile avatar (local upload)
exports.updateTenantAvatar = async (req, res) => {
  try {
    const tenantId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const imageUrl = `/uploads/avatars/${req.file.filename}`;

    const updated = await User.findByIdAndUpdate(
      tenantId,
      { avatar: imageUrl },
      { new: true }
    ).select("-password");

    res.json({ success: true, avatar: updated.avatar });

  } catch (err) {
    console.error("Update Tenant Avatar Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// CHANGE PASSWORD
exports.changeTenantPassword = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(tenantId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Old password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });

  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
