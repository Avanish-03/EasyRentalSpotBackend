const User = require("../models/User");
const bcrypt = require("bcryptjs");
const deleteFile = require("../utils/deleteFile");

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;

    // Email must be unique
    if (email) {
      const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (exists)
        return res.status(400).json({ success: false, message: "Email already used" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone, email },
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE AVATAR
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No image uploaded" });

    const user = await User.findById(req.user.id);

    // delete old avatar
    if (user.avatar) deleteFile(user.avatar);

    const avatarUrl = "/uploads/avatars/" + req.file.filename;

    user.avatar = avatarUrl;
    await user.save();

    res.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const user = await User.findById(req.user.id);

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match)
      return res.status(400).json({ success: false, message: "Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
