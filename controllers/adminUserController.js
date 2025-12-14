// controllers/adminUserController.js
const User = require("../models/User");
const mongoose = require("mongoose");

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    const filters = {};

    if (role) filters["role"] = role; // role = ObjectId or string name
    if (status) filters["status"] = status;

    if (search) {
      filters.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filters)
      .select("-password")
      .populate("role", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort("-createdAt");

    const total = await User.countDocuments(filters);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      },
      users
    });

  } catch (err) {
    console.error("getAllUsers err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success:false, message:"Invalid user id" });
    }

    const user = await User.findById(id).select("-password").populate("role", "name");
    if (!user) return res.status(404).json({ success:false, message:"User not found" });

    res.json({ success:true, user });

  } catch (err) {
    console.error("getUserById err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;

    const allowed = ["fullName", "email", "phone", "avatar", "role"];
    const updates = {};

    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    // If email changed, ensure unique
    if (updates.email) {
      const exists = await User.findOne({ email: updates.email, _id: { $ne: id } });
      if (exists) return res.status(400).json({ success:false, message:"Email already exists" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new:true })
      .select("-password")
      .populate("role", "name");

    if (!updatedUser) return res.status(404).json({ success:false, message:"User not found" });

    res.json({ success:true, user: updatedUser });

  } catch (err) {
    console.error("updateUser err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// PUT /api/admin/users/:id/block
exports.blockUser = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findByIdAndUpdate(id, { status: "blocked" }, { new:true }).select("-password");
    if (!user) return res.status(404).json({ success:false, message:"User not found" });

    res.json({ success:true, message:"User blocked", user });

  } catch (err) {
    console.error("blockUser err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// PUT /api/admin/users/:id/unblock
exports.unblockUser = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findByIdAndUpdate(id, { status: "active" }, { new:true }).select("-password");
    if (!user) return res.status(404).json({ success:false, message:"User not found" });

    res.json({ success:true, message:"User unblocked", user });

  } catch (err) {
    console.error("unblockUser err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success:false, message:"User not found" });

    res.json({ success:true, message:"User deleted" });

  } catch (err) {
    console.error("deleteUser err:", err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};
