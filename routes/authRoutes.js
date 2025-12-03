const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
const Role = require("../models/Role");
const authMiddleware = require("../middleware/authMiddleware");

dotenv.config();
const router = express.Router();


// 🔹 REGISTER USER
router.post("/register", async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);
    const { fullName, email, password, roleName } = req.body;
    console.log("roleName:", roleName);

    // Check existing us  er
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Validate role (frontend sends: "tenant" / "owner")
    const findRole = await Role.findOne({
      name: { $regex: new RegExp("^" + roleName + "$", "i") }
    });

    if (!findRole)
      return res.status(400).json({ message: "Invalid role provided" });

    // Create user
    const newUser = new User({
      fullName,
      email,
      password,
      role: findRole._id,
    });

    await newUser.save();

    res.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: findRole.name,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).populate("role", "name");
    if (!user) return res.status(400).json({ message: "User not found" });

    // ROLE VALIDATION (Important)
    if (role !== user.role.name) {
      return res.status(400).json({ message: "Role mismatch" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("LOGIN BODY:", req.body);
    console.log("User from DB:", user);
    console.log("Password entered:", password);
    console.log("Password in DB:", user.password);
    console.log("Match result:", isMatch);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// 🔹 GET LOGGED-IN USER
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("role", "name");

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
