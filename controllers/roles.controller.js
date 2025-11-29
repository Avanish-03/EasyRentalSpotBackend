const Role = require('../models/Role');

// Create Role
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    const exists = await Role.findOne({ name });
    if (exists) return res.status(400).json({ message: "Role already exists" });

    const role = await Role.create({ name, description });

    res.status(201).json({ message: "Role created", role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.status(200).json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Role
exports.updateRole = async (req, res) => {
  try {
    const updates = req.body;
    const role = await Role.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!role) return res.status(404).json({ message: "Role not found" });

    res.status(200).json({ message: "Role updated", role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    res.status(200).json({ message: "Role deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
